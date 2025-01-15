import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { genai } from "https://esm.sh/@google/generative-ai@0.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Received request:", req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() !== "websocket") {
      console.log("Non-WebSocket request, returning WebSocket URL");
      const host = headers.get("host") || "";
      const wsProtocol = host.includes("localhost") ? "ws" : "wss";
      const wsUrl = `${wsProtocol}://${host}/functions/v1/initialize-daily-bot`;
      
      return new Response(
        JSON.stringify({ 
          success: true,
          websocket_url: wsUrl
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    console.log("Upgrading to WebSocket connection");
    const { socket, response } = Deno.upgradeWebSocket(req);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY");
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new genai.Client({ 
      apiKey: GEMINI_API_KEY,
      http_options: {
        api_version: 'v1alpha'
      }
    });

    let session: any = null;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message type:", data.setup ? "setup" : "realtime_input");
        
        if (data.setup) {
          console.log("Setup received:", data.setup);
          try {
            session = await genAI.live.connect({
              model: "gemini-2.0-flash-exp",
              config: data.setup
            });
            console.log("Gemini API Connected");
            socket.send(JSON.stringify({text:"Gemini API connected"}));
          } catch (e) {
            console.error("Failed to connect to Gemini:", e);
            socket.send(JSON.stringify({error: "Failed to connect to Gemini"}));
          }
          return;
        }

        if (data.realtime_input) {
          const { media_chunks } = data.realtime_input;

          for (const chunk of media_chunks) {
            try {
              await session?.send(chunk);
              console.log("Sent chunk:", chunk.mime_type);
            } catch (e) {
              console.error("Error sending chunk:", e);
              socket.send(JSON.stringify({ error: `Error sending ${chunk.mime_type} chunk` }));
            }
          }

          try {
            for await (const response of session?.receive() || []) {
              if (!response.server_content?.model_turn) {
                console.log("No model turn in response");
                continue;
              }

              const { parts } = response.server_content.model_turn;
              for (const part of parts) {
                if (part.text) {
                  socket.send(JSON.stringify({ text: part.text }));
                }
                if (part.inline_data) {
                  const base64_audio = btoa(String.fromCharCode(...part.inline_data.data));
                  socket.send(JSON.stringify({ audio: base64_audio }));
                }
              }

              if (response.server_content.turn_complete) {
                console.log('\n<Turn complete>');
              }
            }
          } catch (e) {
            console.error("Error receiving from Gemini:", e);
            socket.send(JSON.stringify({ error: "Error receiving from Gemini" }));
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
        socket.send(JSON.stringify({ error: "Failed to process message" }));
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
      if (session) {
        session.disconnect();
        session = null;
      }
    };

    return response;
  } catch (error) {
    console.error('Error in initialize-daily-bot:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to initialize interview assistant',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});