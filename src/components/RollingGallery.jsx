import { useEffect, useRef, useState, useCallback } from "react"; // Added useCallback
import { motion, useMotionValue, useAnimation, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icons
import "./RollingGallery.css";

const IMGS = [
  "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1495103033382-fe343886b671?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1506781961370-37a89d6b3095?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1599576838688-8a6c11263108?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1494094892896-7f14a4433b7a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1664910706524-e783eed89e71?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1503788311183-fa3bf9c4bc32?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5?q=80&w=3774&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const RollingGallery = ({ autoplay = false, pauseOnHover = false, images = [] }) => {
  // Use provided images if available, otherwise default to IMGS
  const displayImages = images.length > 0 ? images : IMGS;
  const [isScreenSizeSm, setIsScreenSizeSm] = useState(window.innerWidth <= 640);

  const cylinderWidth = isScreenSizeSm ? 1100 : 1800;
  const faceCount = displayImages.length;
  // Handle case where faceCount might be 0 to avoid division by zero
  const faceWidth = faceCount > 0 ? (cylinderWidth / faceCount) * 1.5 : 0; // Increased width for items
  const dragFactor = 0.05;
  const radius = faceCount > 0 ? cylinderWidth / (2 * Math.PI) : 0;

  const rotation = useMotionValue(0);
  const controls = useAnimation();
  const rotationStep = faceCount > 0 ? 360 / faceCount : 0;
  const autoplayRef = useRef();

  const handleDrag = (_, info) => {
    rotation.set(rotation.get() + info.offset.x * dragFactor);
  };

  const handleDragEnd = (_, info) => {
    controls.start({
      rotateY: rotation.get() + info.velocity.x * dragFactor,
      transition: { type: "spring", stiffness: 60, damping: 20, mass: 0.1, ease: "easeOut" },
    });
  };

  const transform = useTransform(rotation, (value) => {
    return `rotate3d(0, 1, 0, ${value}deg)`;
  });

  // Rotation functions for buttons
  const rotateManually = useCallback((direction) => {
    if (faceCount === 0) return;
    // Clear autoplay interval if user interacts manually
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null; // Indicate manual control took over
    }
    controls.stop(); // Stop any ongoing animation

    const currentRotation = rotation.get();
    const targetRotation = direction === 'left'
      ? currentRotation + rotationStep
      : currentRotation - rotationStep;

    rotation.set(targetRotation); // Set immediately for responsiveness if needed
    controls.start({
      rotateY: targetRotation,
      // Use a spring animation for manual rotation for a nice feel
      transition: { type: "spring", stiffness: 100, damping: 20, mass: 0.5 },
    });
  }, [rotation, controls, faceCount, rotationStep]);


  // Autoplay effect with adjusted timing
  useEffect(() => {
    // Only start autoplay if it hasn't been overridden by manual controls
    if (autoplay && faceCount > 0 && !autoplayRef.current === null) {
      const rotationStep = 360 / faceCount;
      autoplayRef.current = setInterval(() => {
        const currentRotation = rotation.get();
        controls.start({
          rotateY: currentRotation - rotationStep,
          transition: { duration: 2, ease: "linear" },
        });
        rotation.set(currentRotation - rotationStep);
      }, 2000); // Interval duration

      return () => clearInterval(autoplayRef.current);
    }
  }, [autoplay, rotation, controls, faceCount]); // Added faceCount dependency

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSizeSm(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pause on hover with smooth transition
  const handleMouseEnter = () => {
    if (autoplay && pauseOnHover) {
      clearInterval(autoplayRef.current);
      controls.stop(); // Stop the animation smoothly
    }
  };

  const handleMouseLeave = () => {
    if (autoplay && pauseOnHover && faceCount > 0) {
      const rotationStep = 360 / faceCount;
      const currentRotation = rotation.get();

      // Restart the animation from the current position
      controls.start({
        rotateY: currentRotation - rotationStep,
        transition: { duration: 2, ease: "linear" },
      });
      rotation.set(currentRotation - rotationStep);

      // Restart the interval
      autoplayRef.current = setInterval(() => {
        const nextRotation = rotation.get();
        controls.start({
          rotateY: nextRotation - rotationStep,
          transition: { duration: 2, ease: "linear" },
        });
        rotation.set(nextRotation - rotationStep);
      }, 2000); // Interval duration
    }
  };

  // Render nothing if there are no images
  if (faceCount === 0) {
    return null;
  }

  return (
    <div className="gallery-container relative"> {/* Added relative positioning */}
      {/* Removed gradient divs */}
      <div className="gallery-content">
        <motion.div
          drag="x"
          className="gallery-track"
          onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
          style={{
            transform: transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          {displayImages.map((item, i) => ( // Changed 'url' to 'item'
            <div
              key={i}
              className="gallery-item"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
              }}
            >
              {/* Check if item is a string (URL) or a component/element */}
              {typeof item === 'string' ? (
                <img src={item} alt={`gallery-${i}`} className="gallery-img" />
              ) : (
                // Render the item directly if it's not a string (assuming it's a React element/component)
                item
              )}
            </div>
          ))}
        </motion.div>
      </div>
      {/* Navigation Buttons */}
      {faceCount > 0 && (
        <>
          <button
            onClick={() => rotateManually('left')}
            className="gallery-nav-button gallery-nav-left"
            aria-label="Previous item"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => rotateManually('right')}
            className="gallery-nav-button gallery-nav-right"
            aria-label="Next item"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
};

export default RollingGallery;