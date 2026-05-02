import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { orders } from '../../data';
import { getDistanceKm } from '../../utils/haversine';

// Custom bouncing marker for delivery partner
const deliveryIcon = divIcon({
  html: `<div style="
    background: #4CAF50;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 12px rgba(76,175,80,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    animation: bounce 1s infinite alternate;
  ">🛵</div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Customer location marker
const customerIcon = divIcon({
  html: `<div style="
    background: #FF4444;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 12px rgba(255,68,68,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  ">📍</div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapFitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = positions.map(pos => [pos[0], pos[1]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [partnerName, setPartnerName] = useState('Suresh Nayak');
  const [orderStatus, setOrderStatus] = useState('On the Way');
  const [estimatedMinutes, setEstimatedMinutes] = useState(23);
  const [currentStep, setCurrentStep] = useState(3);

  // Bhubaneswar center as default customer location
  const customerLocation = { lat: 20.2961, lng: 85.8245 };

  useEffect(() => {
    // Find the order
    const foundOrder = orders.find(o => o.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }

    // Setup Firebase listener for live location
    import('../../lib/firebase').then(({ database }) => {
      import('firebase/database').then(({ ref, onValue }) => {
        const locationRef = ref(database, 'deliveries/' + orderId + '/location');
        const unsubscribe = onValue(
          locationRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setPartnerLocation({ lat: data.lat, lng: data.lng });
              setPartnerName(data.partnerName || 'Suresh Nayak');
              setOrderStatus(data.status || 'On the Way');

              // Calculate estimated time
              const distKm = getDistanceKm(
                data.lat,
                data.lng,
                customerLocation.lat,
                customerLocation.lng
              );
              const mins = Math.ceil((distKm / 25) * 60);
              setEstimatedMinutes(mins < 1 ? 1 : mins);
            }
          },
          (error) => {
            console.error('Firebase error:', error);
          }
        );

        return () => unsubscribe();
      });
    });
  }, [orderId]);

  const steps = [
    { num: 1, label: 'Order Placed', icon: '✅' },
    { num: 2, label: 'Being Prepared', icon: '🍳' },
    { num: 3, label: 'Picked Up', icon: '🛵' },
    { num: 4, label: 'On the Way', icon: '🚀' },
    { num: 5, label: 'Delivered', icon: '📍' }
  ];

  const mapPositions = partnerLocation
    ? [
        [partnerLocation.lat, partnerLocation.lng],
        [customerLocation.lat, customerLocation.lng]
      ]
    : [[customerLocation.lat, customerLocation.lng]];

  return (
    <div style={{ color: '#1A1A1A', paddingBottom: '40px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          marginBottom: '16px',
          padding: '0'
        }}
      >
        ←
      </button>

      {/* Header */}
      <h1
        style={{
          fontSize: '28px',
          fontFamily: "'Cormorant Garamond', serif",
          color: '#1A2E1A',
          marginBottom: '4px',
          fontWeight: '700'
        }}
      >
        Track Your Order
      </h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
        #{orderId || 'ORD-001'}
      </p>

      {/* Time Estimation Box */}
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          border: '4px solid #4CAF50',
          boxShadow: '0 4px 24px rgba(76,175,80,0.12)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            fontSize: '48px',
            animation: 'spin-slow 4s linear infinite'
          }}
        >
          🕐
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px 0' }}>
            Arriving in
          </p>
          <h2
            style={{
              fontSize: '32px',
              color: '#1A2E1A',
              fontWeight: 'bold',
              margin: '0 0 4px 0',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {estimatedMinutes < 1 ? 'Arriving soon!' : `${estimatedMinutes} min`}
          </h2>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px 0' }}>
            Estimated delivery time
          </p>
          <p style={{ color: '#4CAF50', fontSize: '14px', margin: '0' }}>
            🛵 {partnerName} is on the way
          </p>
        </div>
      </div>

      {/* Order Status Stepper */}
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(76,175,80,0.1)',
          border: '1px solid #E8F5E9',
          marginBottom: '24px'
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1A2E1A',
            marginBottom: '20px',
            fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif"
          }}
        >
          Order Progress
        </h3>
        {steps.map((step, idx) => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: idx < steps.length - 1 ? '8px' : '0', position: 'relative' }}>
            {/* Step Circle */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background:
                  step.num < currentStep
                    ? 'linear-gradient(135deg, #4CAF50, #388E3C)'
                    : step.num === currentStep
                    ? '#4CAF50'
                    : '#F5F5F5',
                border: step.num === currentStep ? '2px solid #4CAF50' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step.num <= currentStep ? 'white' : '#BDBDBD',
                fontSize: '18px',
                flexShrink: 0,
                boxShadow:
                  step.num === currentStep
                    ? '0 0 0 0 rgba(76, 175, 80, 0.5)'
                    : 'none',
                animation:
                  step.num === currentStep
                    ? 'pulse 1.5s ease infinite'
                    : 'none'
              }}
            >
              {step.num < currentStep ? '✓' : step.icon}
            </div>

            {/* Connecting Line */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '21px',
                  top: '44px',
                  width: '2px',
                  height: '40px',
                  background:
                    step.num < currentStep ? '#4CAF50' : '#E0E0E0'
                }}
              />
            )}

            {/* Step Label */}
            <div
              style={{
                flex: 1,
                color:
                  step.num <= currentStep ? '#1A2E1A' : '#888888',
                fontWeight:
                  step.num === currentStep ? '700' : '600',
                fontSize: '15px',
                paddingTop: '4px',
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif"
              }}
            >
              {step.label}
            </div>

            {/* In Progress Badge */}
            {step.num === currentStep && (
              <div
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}
              >
                in progress
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live Map */}
      {(partnerLocation || customerLocation) && (
        <div
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(76,175,80,0.1)',
            border: '1px solid #E8F5E9',
            marginBottom: '24px'
          }}
        >
          <MapContainer
            center={[customerLocation.lat, customerLocation.lng]}
            zoom={13}
            style={{ height: '350px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            {/* Customer Location */}
            <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
              <Popup>Your Delivery Address</Popup>
            </Marker>
            {/* Delivery Partner Location */}
            {partnerLocation && (
              <>
                <Marker
                  position={[partnerLocation.lat, partnerLocation.lng]}
                  icon={deliveryIcon}
                >
                  <Popup>{partnerName} is here</Popup>
                </Marker>
                {/* Connecting Line */}
                <Polyline
                  positions={[
                    [partnerLocation.lat, partnerLocation.lng],
                    [customerLocation.lat, customerLocation.lng]
                  ]}
                  pathOptions={{ color: '#4CAF50', dashArray: '5, 5' }}
                />
              </>
            )}
            <MapFitBounds positions={mapPositions} />
          </MapContainer>
        </div>
      )}

      {/* Delivery Partner Info Card */}
      {partnerLocation && (
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(76,175,80,0.1)',
            border: '1px solid #E8F5E9',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0
            }}
          >
            🛵
          </div>

          {/* Partner Info */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: '0 0 4px 0',
                fontSize: '16px',
                fontWeight: '700',
                color: '#1A2E1A',
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif"
              }}
            >
              {partnerName}
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#888' }}>
              ⭐ 4.7 (128 reviews)
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#1A1A1A' }}>
              📞 +91 9876543210
            </p>
          </div>

          {/* Call Button */}
          <button
            style={{
              background: 'white',
              color: '#4CAF50',
              border: '2px solid #4CAF50',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#4CAF50';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#4CAF50';
            }}
          >
            📞 Call
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
