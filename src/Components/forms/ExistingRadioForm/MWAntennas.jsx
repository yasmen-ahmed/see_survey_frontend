import React, { useState } from "react";

const MwAntennasForm = () => {
  const [mwData, setMwData] = useState({
    antennaCount: "",
    antennas: [],
  });
  const [error, setError] = useState("");

  const handleAntennaCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (!count || count < 1) {
      setMwData({ antennaCount: "", antennas: [] });
      return;
    }

    const antennas = Array.from({ length: count }, () => ({
      height: "",
      diameter: "",
      azimuth: "",
    }));

    setMwData({ antennaCount: e.target.value, antennas });
    setError(""); // clear previous errors
  };

  const handleAntennaChange = (index, field, value) => {
    const updated = [...mwData.antennas];
    updated[index][field] = value;
    setMwData({ ...mwData, antennas: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = mwData.antennas.every(
      (ant) => ant.height && ant.diameter && ant.azimuth
    );

    if (!isValid) {
      setError("Please fill all fields for each MW antenna.");
      return;
    }

    // Send the data to backend or console
    console.log("Submitted MW Data:", mwData);

    // Optional: reset form
    alert("Data saved successfully!");
  };

  const handleReset = () => {
    setMwData({ antennaCount: "", antennas: [] });
    setError("");
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full mt-6">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        {/* MW Antenna Count */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">
            How many MW antennas on the tower?
          </label>
          <select
            name="antennaCount"
            value={mwData.antennaCount}
            onChange={handleAntennaCountChange}
            className="border p-3 rounded-md"
          >
            <option value="">-- Select --</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="md:col-span-2 text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Antennas Detail Section */}
        {mwData.antennas.map((antenna, index) => (
          <div
            key={index}
            className="md:col-span-2 border-t pt-4 mt-4 space-y-4"
          >
            <h3 className="font-bold text-lg">MW Antenna #{index + 1}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold mb-1">
                  MW antenna height (meter)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={antenna.height}
                  onChange={(e) =>
                    handleAntennaChange(index, "height", parseFloat(e.target.value) || "")
                  }
                  className="border p-3 rounded-md"
                  placeholder="e.g. 20.5"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">
                  MW antenna diameter (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={antenna.diameter}
                  onChange={(e) =>
                    handleAntennaChange(index, "diameter", parseFloat(e.target.value) || "")
                  }
                  className="border p-3 rounded-md"
                  placeholder="e.g. 60"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">
                  MW antenna azimuth (degree)
                </label>
                <input
                  type="number"
                  min="0"
                  max="360"
                  step="1"
                  value={antenna.azimuth}
                  onChange={(e) =>
                    handleAntennaChange(index, "azimuth", parseInt(e.target.value) || "")
                  }
                  className="border p-3 rounded-md"
                  placeholder="e.g. 180"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Buttons */}
        {mwData.antennaCount && (
          <div className="md:col-span-2 flex justify-center gap-4 mt-6">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save and Continue
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 text-white bg-gray-600 rounded hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MwAntennasForm;
