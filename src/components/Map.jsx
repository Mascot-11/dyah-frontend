import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function LocationMap() {
  const position = [27.715911085904363, 85.30978219242121]; // Dyah Khyah Tattoo, Kathmandu

  return (
    <section className="max-w-6xl mx-auto my-20 px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-10 tracking-wide uppercase">
        Our Location
      </h2>

      <div className="rounded-xl overflow-hidden shadow-xl border border-white/10">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>
              <strong>Dyah Khyah Tattoo</strong><br />Kathmandu
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </section>
  );
}

export { LocationMap };
