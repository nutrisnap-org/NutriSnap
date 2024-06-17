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
      return new Response(JSON.stringify({
        displayName: "not found",
        email: "not found",
        photoURL: "https://lh3.googleusercontent.com/a/ACg8ocLhZ6HQmmGveICIBAONTmLFL8ieevYV08Fp7YHT5YJyVZg=s96-c",
        totalCalories: 0,
        totalProtein: 0,
        last24HoursCalories: 0,
        last24HoursProtein: 0,
        xp: 0
      }), { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    const { displayName = "N/A", email: userEmail = "N/A", photoURL = "https://lh3.googleusercontent.com/a/ACg8ocLhZ6HQmmGveICIBAONTmLFL8ieevYV08Fp7YHT5YJyVZg=s96-c", unhashedfoodsnapUrls = [], xp = 0 } = userData;

    let totalCalories = 0;
    let totalProtein = 0;
    let last24HoursCalories = 0;
    let last24HoursProtein = 0;

    const currentTime = new Date().getTime();

    unhashedfoodsnapUrls.forEach((item) => {
      totalCalories += parseFloat(item.calories || 0);
      totalProtein += parseFloat(item.protein || 0);

      const itemTime = item.timestamp?.seconds * 1000 || new Date(item.timestamp).getTime();
      if ((currentTime - itemTime) <= 24 * 60 * 60 * 1000) { // Check if the timestamp is within the last 24 hours
        last24HoursCalories += parseFloat(item.calories || 0);
        last24HoursProtein += parseFloat(item.protein || 0);
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
    return new Response(JSON.stringify({
      displayName: "user not found",
      email: "not found 404",
      photoURL: "https://nutrisnap.tech/profile/rahulsinghhh2312@gmail.com",
      totalCalories: 0,
      totalProtein: 0,
      last24HoursCalories: 0,
      last24HoursProtein: 0,
      xp: 0,
      error: 'Internal Server Error'
    }), { status: 500 });
  }
}
