import { db } from "../../utils/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// GET method
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
  }

  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    const { displayName, email: userEmail, photoURL, unhashedfoodsnapUrls, xp } = userData;

    let totalCalories = 0;
    let totalProtein = 0;
    let last24HoursCalories = 0;
    let last24HoursProtein = 0;

    const currentTime = new Date().getTime();

    unhashedfoodsnapUrls.forEach((item) => {
      totalCalories += parseFloat(item.calories);
      totalProtein += parseFloat(item.protein);

      const itemTime = item.timestamp?.seconds * 1000 || new Date(item.timestamp).getTime();
      if ((currentTime - itemTime) <= 24 * 60 * 60 * 1000) { // Check if the timestamp is within the last 24 hours
        last24HoursCalories += parseFloat(item.calories);
        last24HoursProtein += parseFloat(item.protein);
      }
    });

    const result = {
      displayName,
      email: userEmail,
      photoURL,
      totalCalories,
      totalProtein,
      last24HoursCalories,
      last24HoursProtein,
      xp,
    };

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error fetching user data: ", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
