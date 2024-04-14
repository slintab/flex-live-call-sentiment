import { Ai } from '@cloudflare/ai';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { SyncClient, SyncStream } from 'twilio-sync';

export interface Env {
	AI: Ai;
	DEEPGRAM_API_KEY: string;
	SYNC_TOKEN_IDENTITY: string;
	SYNC_SERVICE_SID: string;
	SYNC_TOKEN_URL: string;
}

interface TwilioStartMessage {
	event: 'start';
	streamSid: string;
	start: {
		callSid: string;
	};
}

interface TwilioMediaMessage {
	event: 'media';
	media: {
		payload: string;
	};
}

interface TwilioStopMessage {
	event: 'stop';
	streamSid: string;
	stop: {
		callSid: string;
	};
}

type TwilioMessage = TwilioStartMessage | TwilioMediaMessage | TwilioStopMessage;

type TokenResponse = {
	token: string;
};

function base64toArrayBuffer(base64: string) {
	const binaryString = atob(base64);
	const chars = [...binaryString];
	const byteArray = new Uint8Array(chars.map((char) => char.charCodeAt(0)));

	return byteArray.buffer;
}

async function getSentiment(text: string, aiClient: Env['AI']) {
	try {
		const response = await aiClient.run('@cf/huggingface/distilbert-sst-2-int8', {
			text,
		});
		return response.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
	} catch {
		return null;
	}
}

async function createSyncClient(tokenUrl: string, identity: string) {
	const url = `${tokenUrl}?identity=${identity}`;
	const response = await fetch(url);
	const data = await response.json();

	return new SyncClient((data as TokenResponse).token);
}

async function createSyncStream(client: SyncClient, name: string) {
	return client.stream({
		id: 'FLEX_LIVE_SENTIMENT_' + name,
		mode: 'open_or_create',
		ttl: 3600,
	});
}

async function handleSession(websocket: WebSocket, env: Env, task: string) {
	websocket.accept();

	const sync = await createSyncClient(env.SYNC_TOKEN_URL, env.SYNC_TOKEN_IDENTITY);
	const syncStream = await createSyncStream(sync, task);
	const deepgram = createClient(env.DEEPGRAM_API_KEY);
	const transcriptList: string[] = [];
	const transcriber = deepgram.listen.live({
		model: 'nova-2',
		interim_results: true,
		encoding: 'mulaw',
		sample_rate: 8000,
	});

	transcriber.on(LiveTranscriptionEvents.Open, () => {
		transcriber.on(LiveTranscriptionEvents.Transcript, async (data) => {
			const transcript = data.channel?.alternatives[0]?.transcript;
			if (transcript && data.is_final) {
				transcriptList.push(transcript);
				const sentiment = await getSentiment(transcriptList.join(' '), env.AI);
				sentiment && (await syncStream.publishMessage(sentiment));
			}
		});
	});

	websocket.addEventListener('message', async (event) => {
		const message: TwilioMessage = JSON.parse(event.data as string);
		switch (message.event) {
			case 'media':
				transcriber.send(base64toArrayBuffer(message.media.payload));
				break;
			case 'stop':
				transcriber.finish();
				await syncStream.removeStream();
				break;
		}
	});
}

async function websocketHandler(request: Request, env: Env, task: string) {
	const upgradeHeader = request.headers.get('Upgrade');
	if (!upgradeHeader || upgradeHeader !== 'websocket') {
		return new Response('Expected Upgrade: websocket', { status: 426 });
	}

	const [client, server] = Object.values(new WebSocketPair());
	await handleSession(server, env, task);

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const url = new URL(request.url);
			const [path, task] = url.pathname.split('/').filter((part) => part !== '');
			switch (path) {
				case 'ws':
					return websocketHandler(request, env, task);
				default:
					return new Response('Not found', { status: 404 });
			}
		} catch (err) {
			return new Response('Not found', { status: 404 });
		}
	},
};
