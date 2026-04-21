import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapImage from "../../assets/map.png";

export default function CampusMap() {
  const [selectedZone, setSelectedZone] = useState(null);
  const navigate = useNavigate();

  const zones = useMemo(
    () => [
      {
        id: "zone-08",
        label: "Zone 08",
        backendZone: "Zone 08",
        type: "polygon",
        points: "1121,408 1509,509 1418,674 1038,560",
      },
      {
        id: "zone-08-02",
        label: "Zone 08.02",
        backendZone: "Zone 08.02",
        type: "polygon",
        points: "1255,639 1194,741 1358,796 1406,686",
      },
      {
        id: "zone-03",
        label: "Zone 03",
        backendZone: "Zone 03",
        type: "rect",
        x: 419,
        y: 331,
        width: 276,
        height: 107,
      },
      {
        id: "zone-03-02",
        label: "Zone 03.02",
        backendZone: "Zone 03.02",
        type: "polygon",
        points: "372,513 442,519 437,594 380,595",
      },
      {
        id: "zone-02",
        label: "Zone 02",
        backendZone: "Zone 02",
        type: "polygon",
        points: "199,311 222,262 390,297 375,333 364,350",
      },
      {
        id: "zone-01",
        label: "Zone 01",
        backendZone: "Zone 01",
        type: "polygon",
        points: "30,567 123,574 117,632 24,629",
      },
    ],
    []
  );

  const handleZoneClick = (zone) => {
    setSelectedZone(zone.id);

    navigate("/parking/map", {
      state: {
        zoneId: zone.id,
        zoneLabel: zone.label,
        backendZone: zone.backendZone,
      },
    });
  };

  return (
    <>
      <div className="campus-map-wrapper">
        <h2 className="map-title">Select a Parking Zone</h2>

        <div className="map-container">
          <img
            src={mapImage}
            alt="Campus Map"
            className="map-image"
            draggable="false"
          />

          <svg
            viewBox="0 0 1536 1024"
            className="map-overlay"
            aria-label="Interactive campus map"
          >
            {zones.map((zone) => {
              const isActive = selectedZone === zone.id;
              const zoneClass = isActive ? "zone active" : "zone";

              if (zone.type === "rect") {
                return (
                  <rect
                    key={zone.id}
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    className={zoneClass}
                    onClick={() => handleZoneClick(zone)}
                  >
                    <title>{zone.label}</title>
                  </rect>
                );
              }

              return (
                <polygon
                  key={zone.id}
                  points={zone.points}
                  className={zoneClass}
                  onClick={() => handleZoneClick(zone)}
                >
                  <title>{zone.label}</title>
                </polygon>
              );
            })}
          </svg>
        </div>

        <div className="info-panel">
          <h3>How it works</h3>
          <p>Step 1: Select a zone from the map.</p>
          <p>Step 2: Choose an available parking slot in that zone.</p>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .campus-map-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          font-family: Arial, sans-serif;
        }

        .map-title {
          margin: 0 0 16px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .map-container {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #f3f4f6;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .map-image {
          display: block;
          width: 100%;
          height: auto;
          user-select: none;
          -webkit-user-drag: none;
        }

        .map-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .zone {
          fill: rgba(255, 0, 0, 0.05);
          stroke: #ef4444;
          stroke-width: 3;
          cursor: pointer;
          transition: fill 0.2s ease, stroke 0.2s ease;
        }

        .zone:hover {
          fill: rgba(59, 130, 246, 0.28);
          stroke: #2563eb;
        }

        .zone.active {
          fill: rgba(37, 99, 235, 0.4);
          stroke: #1d4ed8;
        }

        .info-panel {
          margin-top: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .info-panel h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #111827;
        }

        .info-panel p {
          margin: 6px 0;
          color: #4b5563;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .campus-map-wrapper {
            padding: 16px;
          }

          .map-title {
            font-size: 20px;
          }

          .zone {
            stroke-width: 2;
          }
        }
      `}</style>
    </>
  );
}