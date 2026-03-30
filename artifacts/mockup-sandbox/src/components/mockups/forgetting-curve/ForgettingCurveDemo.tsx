import { ForgettingCurveBackground } from "./ForgettingCurveBackground";

export function ForgettingCurveDemo() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <ForgettingCurveBackground />
      
      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 
            className="text-6xl font-black text-white mb-6 uppercase"
            style={{
              textShadow: "0 0 20px #00FF41, 4px 4px 0 #000000"
            }}
          >
            THE FORGETTING CURVE
          </h1>
          <p className="text-2xl text-white font-bold max-w-2xl" style={{textShadow: "4px 4px 0 #000000"}}>
            Watch how knowledge decays over time. Click anywhere to trigger a recovery spike.
          </p>
        </div>
      </div>
    </div>
  );
}
