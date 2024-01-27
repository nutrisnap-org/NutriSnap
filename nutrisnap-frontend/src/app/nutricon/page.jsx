'use client'
import { useState, useEffect } from 'react';
import { getCalApi } from "@calcom/embed-react";
import nutritionistsData from './nutritionist.json'; // Assuming you have the JSON data in a file

export default function NutritionistsPage() {
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);

  const handleBookMeeting = (nutritionist) => {
    console.log('Booking Zoom meeting with:', nutritionist.name);
    setSelectedNutritionist(nutritionist);
  };

  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi();
        console.log('Calendar API initialized:', cal);
        console.log('Namespace:', cal.ns);
        if (cal.ns) {
          cal.ns["15min"]("ui", {"styles":{"branding":{"brandColor":"#000000"}},"hideEventTypeDetails":false,"layout":"month_view"});
        }
      } catch (error) {
        console.error('Error initializing calendar API:', error);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Nutritionists</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nutritionistsData.nutritionists.map((nutritionist) => (
          <div key={nutritionist.id} className="border rounded-lg overflow-hidden shadow-md">
            <img src={` ${nutritionist.profile_picture}`} alt={nutritionist.name} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{nutritionist.name}</h2>
              <p className="text-gray-600 mb-2">{nutritionist.specialization.join(', ')}</p>
              <p className="text-gray-600 mb-2">{nutritionist.location}</p>
              <button onClick={() => handleBookMeeting(nutritionist)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Book Zoom Meeting</button>
            </div>
          </div>
        ))}
      </div>
      <h1 className="text-2xl mt-10 font-bold mb-6">Skin Experts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nutritionistsData.skin_experts.map((skin_expert) => (
          <div key={skin_expert.id} className="border rounded-lg overflow-hidden shadow-md">
            <img src={` ${skin_expert.profile_picture}`} alt={skin_expert.name} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{skin_expert.name}</h2>
              <p className="text-gray-600 mb-2">{skin_expert.specialization.join(', ')}</p>
              <p className="text-gray-600 mb-2">{skin_expert.location}</p>
              <button onClick={() => handleBookMeeting(skin_expert)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Book Zoom Meeting</button>
            </div>
          </div>
        ))}
      </div>
      {selectedNutritionist && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Book a Zoom Meeting with {selectedNutritionist.name}</h2>
            <a href='https://cal.com/prathik-shetty/15min' target='_blank'><button  onClick={() => setSelectedNutritionist(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">Book Now</button></a>
          </div>
        </div>
      )}
      <button data-cal-namespace="15min"
	  data-cal-link="prathik-shetty/15min"
    
	  data-cal-config='{"layout":"month_view"}'
	  >Click me</button>;
    </div>
  );
}