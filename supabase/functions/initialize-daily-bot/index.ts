import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { genai } from "https://esm.sh/@google/generative-ai@0.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);
      const genAI = new genai.Client();

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.setup) {
            console.log("Received setup message:", data.setup);
            socket.send(JSON.stringify({ text: "Setup received, ready for interaction" }));
            return;
          }

          if (data.realtime_input) {
            const { media_chunks } = data.realtime_input;
            
            for (const chunk of media_chunks) {
              if (chunk.mime_type === "audio/pcm") {
                console.log("Received audio chunk");
              } else if (chunk.mime_type === "image/jpeg") {
                console.log("Received image chunk");
              }
            }

            socket.send(JSON.stringify({
              text: "I received your input and am processing it.",
            }));
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
      };

      return response;
    }

    // For non-WebSocket requests, return the WebSocket URL
    const host = req.headers.get("host") || "";
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