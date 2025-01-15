import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { VideoClosingAnimationProps } from "./types";

const tvOffAnimation = {
  "v": "5.5.7",
  "meta": { "g": "LottieFiles AE 0.1.20", "a": "", "k": "", "d": "", "tc": "" },
  "fr": 29.9700012207031,
  "ip": 0,
  "op": 30.0000012219251,
  "w": 400,
  "h": 400,
  "nm": "TV Turn Off",
  "ddd": 0,
  "assets": [],
  "layers": [{
    "ddd": 0,
    "ind": 1,
    "ty": 4,
    "nm": "Shape Layer 1",
    "sr": 1,
    "ks": {
      "o": { "a": 0, "k": 100, "ix": 11 },
      "r": { "a": 0, "k": 0, "ix": 10 },
      "p": { "a": 0, "k": [200, 200, 0], "ix": 2 },
      "a": { "a": 0, "k": [0, 0, 0], "ix": 1 },
      "s": {
        "a": 1,
        "k": [
          {
            "i": { "x": [0.833, 0.833, 0.833], "y": [0.833, 0.833, 0.833] },
            "o": { "x": [0.167, 0.167, 0.167], "y": [0.167, 0.167, 0.167] },
            "t": 0,
            "s": [100, 100, 100]
          },
          {
            "i": { "x": [0.833, 0.833, 0.833], "y": [0.833, 0.833, 0.833] },
            "o": { "x": [0.167, 0.167, 0.167], "y": [0.167, 0.167, 0.167] },
            "t": 15,
            "s": [100, 2, 100]
          },
          { "t": 29.0000011811942, "s": [100, 0, 100] }
        ],
        "ix": 6
      }
    },
    "ao": 0,
    "shapes": [{
      "ty": "rc",
      "d": 1,
      "s": { "a": 0, "k": [400, 400], "ix": 2 },
      "p": { "a": 0, "k": [0, 0], "ix": 3 },
      "r": { "a": 0, "k": 0, "ix": 4 },
      "nm": "Rectangle Path 1",
      "mn": "ADBE Vector Shape - Rect",
      "hd": false
    }],
    "ip": 0,
    "op": 30.0000012219251,
    "st": 0,
    "bm": 0
  }],
  "markers": []
};

export const VideoClosingAnimation = ({ 
  isVisible, 
  onAnimationComplete,
  mode = 'turnOff' 
}: VideoClosingAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    onAnimationComplete();
  };

  if (!isAnimating) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Lottie
        animationData={tvOffAnimation}
        loop={false}
        onComplete={handleAnimationComplete}
        className="w-full h-full"
        initialSegment={mode === 'turnOn' ? [29, 0] : undefined}
      />
    </div>
  );
};
