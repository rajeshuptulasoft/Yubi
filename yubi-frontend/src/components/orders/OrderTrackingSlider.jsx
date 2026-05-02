import { Fragment } from "react";
import {
  DELIVERY_TRACK_STEPS,
  getResolvedDeliveryTrackState,
  isStepCurrent,
  isStepDone,
} from "@/lib/userOrders";

function segmentGreenAfterStep(stepIndex, mode, activeStepIndex) {
  if (mode === "complete") return true;
  if (mode === "cancelled") return false;
  return stepIndex < activeStepIndex;
}

function isGreenCurrentStep(currentStepIndex) {
  return currentStepIndex === 1 || currentStepIndex === 3;
}

/**
 * Swiggy-style horizontal tracking.
 * Optional `trackingStepIndex` (0–4) from GET /food/order-status/:id takes precedence.
 */
export default function OrderTrackingSlider({ statusRaw, paymentStatusRaw, cancelledAt, trackingStepIndex }) {
  const track = getResolvedDeliveryTrackState(
    statusRaw,
    paymentStatusRaw,
    cancelledAt,
    trackingStepIndex,
  );

  if (track.mode === "cancelled") {
    return (
      <div style={wrap}>
        <div style={cancelBar}>This order has been cancelled.</div>
      </div>
    );
  }

  const steps = DELIVERY_TRACK_STEPS;

  return (
    <div style={wrap}>
      <div style={{ fontWeight: 800, color: "#1A2E1A", fontSize: 13, marginBottom: 12 }}>Tracking</div>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%", overflowX: "auto", paddingBottom: 4 }}>
        {steps.map((label, i) => {
          const done = isStepDone(i, track.mode, track.activeStepIndex);
          const current = isStepCurrent(i, track.mode, track.activeStepIndex);
          const greenCurrent = current && isGreenCurrentStep(track.activeStepIndex);
          const activeGreen = done || track.mode === "complete" || greenCurrent;
          const last = i === steps.length - 1;

          return (
            <Fragment key={label}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1 1 56px",
                  minWidth: 52,
                  maxWidth: 110,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      background:
                        activeGreen
                          ? "#2E7D32"
                          : current
                            ? "#FF6F00"
                            : "#FFFFFF",
                      color: activeGreen || current ? "#FFFFFF" : "#BDBDBD",
                      border:
                        activeGreen
                          ? "2px solid #2E7D32"
                          : current
                            ? "2px solid #FF6F00"
                            : "2px solid #E0E0E0",
                      boxShadow: current
                        ? greenCurrent
                          ? "0 2px 8px rgba(46,125,50,0.35)"
                          : "0 2px 8px rgba(255,111,0,0.4)"
                        : "none",
                      zIndex: 2,
                    }}
                    aria-hidden
                  >
                    {activeGreen ? "✓" : i + 1}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    textAlign: "center",
                    fontSize: 9,
                    lineHeight: 1.35,
                    color: activeGreen ? "#2E7D32" : current ? "#E65100" : "#757575",
                    fontWeight: activeGreen || current ? 800 : 600,
                  }}
                >
                  {label}
                </div>
              </div>
              {!last ? (
                <div
                  style={{
                    flex: "1 1 4px",
                    minWidth: 6,
                    height: 3,
                    alignSelf: "flex-start",
                    marginTop: 13,
                    background: segmentGreenAfterStep(i, track.mode, track.activeStepIndex) ? "#2E7D32" : "#E0E0E0",
                    borderRadius: 2,
                  }}
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

const wrap = { marginTop: 16 };
const cancelBar = {
  background: "#FFEBEE",
  color: "#C62828",
  padding: "12px 14px",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  border: "1px solid #FFCDD2",
};
