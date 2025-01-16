import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { genai } from "https://esm.sh/@google/generative-ai@0.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";
    console.log("Request headers:", headers);

    // Check for WebSocket upgrade
    if (upgradeHeader.toLowerCase() !== "websocket") {
      const host = headers.get("host") || "";
      const wsProtocol = host.includes("localhost") ? "ws" : "wss";
      const wsUrl = `${wsProtocol}://${host}/functions/v1/initialize-daily-bot`;
      
      console.log("Returning WebSocket URL:", wsUrl);
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

    // Initialize Gemini client
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const genAI = new genai.Client({
      apiKey: GEMINI_API_KEY,
      http_options: {
        api_version: 'v1alpha'
      }
    });

    // Upgrade to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);
    let session: any = null;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        if (data.setup) {
          try {
            session = await genAI.live.connect({
              model: "gemini-2.0-flash-exp",
              config: data.setup
            });
            console.log("Gemini API Connected");
            socket.send(JSON.stringify({text: "Gemini API connected"}));
          } catch (e) {
            console.error("Failed to connect to Gemini:", e);
            socket.send(JSON.stringify({error: "Failed to connect to Gemini"}));
            return;
          }
          return;
        }

        if (!session) {
          console.error("No active Gemini session");
          socket.send(JSON.stringify({error: "No active Gemini session"}));
          return;
        }

        if (data.realtime_input && session) {
          const { media_chunks } = data.realtime_input;
          
          for (const chunk of media_chunks) {
            try {
              await session.send(chunk);
              console.log("Sent chunk:", chunk.mime_type);
            } catch (e) {
              console.error("Error sending chunk:", e);
              socket.send(JSON.stringify({error: `Error sending ${chunk.mime_type} chunk`}));
            }
          }

          try {
            for await (const response of session.receive()) {
              if (!response.server_content?.model_turn) {
                console.log("No model turn in response");
                continue;
              }

              const { parts } = response.server_content.model_turn;
              for (const part of parts) {
                if (part.text) {
                  socket.send(JSON.stringify({text: part.text}));
                }
                if (part.inline_data) {
                  const base64_audio = btoa(String.fromCharCode(...part.inline_data.data));
                  socket.send(JSON.stringify({audio: base64_audio}));
                }
              }

              if (response.server_content.turn_complete) {
                console.log('\n<Turn complete>');
              }
            }
          } catch (e) {
            console.error("Error receiving from Gemini:", e);
            socket.send(JSON.stringify({error: "Error receiving from Gemini"}));
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
        socket.send(JSON.stringify({error: "Failed to process message"}));
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