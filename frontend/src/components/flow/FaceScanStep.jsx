const FaceScanStep = ({ next, back }) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Face Scan</h2>

      <div className="h-40 flex items-center justify-center border rounded-xl mb-4">
        Webcam Preview Here
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Align your face and follow instructions.
      </p>

      <div className="flex gap-2">
        <button onClick={back} className="flex-1 py-3 border rounded-xl">
          Back
        </button>
        <button
          onClick={() => next({ face: "captured" })}
          className="flex-1 py-3 bg-black text-white rounded-xl"
        >
          Continue
        </button>
      </div>
    </>
  );
};

export default FaceScanStep;
