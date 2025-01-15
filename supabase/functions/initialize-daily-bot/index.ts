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
          // Handle initial setup message
          console.log("Received setup message:", data.setup);
          return;
        }

        if (data.realtime_input) {
          // Process media chunks
          const { media_chunks } = data.realtime_input;
          
          // Process audio and image data
          for (const chunk of media_chunks) {
            if (chunk.mime_type === "audio/pcm") {
              // Process audio chunk
              console.log("Received audio chunk");
            } else if (chunk.mime_type === "image/jpeg") {
              // Process image chunk
              console.log("Received image chunk");
            }
          }

          // Send response back to client
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
  const wsUrl = `wss://${req.headers.get("host")}/functions/v1/initialize-daily-bot`;
  
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
});