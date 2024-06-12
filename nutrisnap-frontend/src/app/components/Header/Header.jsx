"use client";
import { Analytics } from "@vercel/analytics/react";
import { useState, useEffect } from "react";
import "./Header.css";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { auth, db } from "../../utils/firebase";
import { useContext } from "react";
import { ProfileContext } from "../../context/profileContext";
import Link from "next/link";
const Header = () => {
  const [user, setUser] = useState(null);
  const [userXP, setUserXP] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const router = useRouter();
  //  const router = useRouter();
  function toggleActive() {
    setIsActive(!isActive);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user's XP from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserXP(userData.xp);
          setUserXP(userData.xp || 0); // Set XP to 0 if userData.xp is undefined
        } else {
          // Handle case where user document doesn't exist
          setUserXP(0);
        }
      } else {
        setUser(null);
        // Reset user's XP if not logged in
      }
    });
    return () => unsubscribe();
  }, []);
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        sessionStorage.removeItem("user");
        setUser(null);

        router.push("/");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };
  const handleClickOutside = (event) => {
    if (dropdownVisible && !event.target.closest(".dropdown")) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  const { darkbg, setDarkbg } = useContext(ProfileContext);
  const path = usePathname();
  const slugId = "id";
  useEffect(() => {
    if (path.includes("/profile/")) {
      setDarkbg(true);
    } else {
      setDarkbg(false);
    }
  });

  return (
    <>
      <Analytics />
      <div
        className={`${
          darkbg ? "text-white bg-gray-950" : "text-gray-950"
        } w-full p-4 md:p-6 flex justify-between items-center z-50`}
      >
        <div className="flex md:mx-12 items-center gap-2">
          <div className="flex gap-3 max-sm:gap-6">
            <Link href="/" className="flex gap-3">
              <img src="/logo.png" alt="" height={30} width={30} />
              <h1 className="font-bold text-xl max-sm:hidden">Nutrisnap</h1>
            </Link>

            {user && (
              <span className="text-sm text-black flex font-bold px-4 py-1 rounded-full bg-white border border-purple-700 shadow-lg">
                XP: {userXP}
              </span>
            )}
          </div>
        </div>
        <ul
          className={`${
            darkbg ? "text-white " : "text-gray-950"
          }list-none gap-12 my-4 md:mx-12 text-md  md:flex items-center justify-between`}
        >
          {!user ? (
            <li>
              <a
                href="/login"
                className="rounded-full px-4 py-2 -ml-4 text-gray-100 bg-black hover:bg-white hover:text-black transition duration-300 ease-in-out"
              >
                Login
              </a>
            </li>
          ) : (
            <>
              <li>
                <a
                  href="/foodsnap"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 transition duration-300 ease-in-out"
                >
                  Food
                </a>
              </li>
              <li>
                <a
                  href="/foodcalender"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 transition duration-300 ease-in-out"
                >
                  Track
                </a>
              </li>
              <li>
                <a
                  href="/skinsnap"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 transition duration-300 ease-in-out"
                >
                  Skin
                </a>
              </li>
              {/* <li>
                <a
                  href="/wearos"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 text-black hover:bg-gray-300 transition duration-300 ease-in-out"
                >
                  WearOS
                </a>
              </li> */}
              {/* <li>
                <a
                  href="/nutricon"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 text-black hover:bg-gray-300 transition duration-300 ease-in-out"
                >
                  NutriCon
                </a>
              </li> */}
              <li>
                <a
                  href="/scoreboard"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 transition duration-300 ease-in-out"
                >
                  Scoreboard
                </a>
              </li>
              <div className="relative">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={toggleDropdown}
                >
                  {user ? (
                    <img
                      src={`${user.photoURL}`}
                      alt=""
                      height={30}
                      width={30}
                      className="mr-4 rounded-full"
                    />
                  ) : (
                    <img
                      src="/logo.png"
                      alt=""
                      height={30}
                      width={30}
                      className="mr-4"
                    />
                  )}
                  {/* <h1 className="md:block cursor-pointer font-bold text-xl max-md:text-sm">
            {user ? `Welcome, ${user.displayName}` : "Nutrisnap"}
          </h1> */}
                </div>
                {dropdownVisible && user && (
                  <div
                    className={`absolute mt-4 p-2 right-0 w-48 ${
                      darkbg ? "bg-black" : "bg-white"
                    }  border rounded-md dropdown shadow-xl z-50`}
                  >
                    <div className="py-2 pl-2 rounded-sm hover:bg-gray-600/40 font-semibold flex gap-2 justify-left items-center">
                      <img
                        src="/profile.svg"
                        alt=""
                        height={30}
                        width={20}
                        className="invert"
                      />
                      <a href="/profile/slugId" className="">
                        Profile & NFTs
                      </a>
                    </div>
                    <div>
                      {user && (
                        <div
                          className="py-2 pl-2 w-full rounded-sm cursor-pointer hover:bg-red-600/40 font-semibold flex gap-2 justify-left items-center"
                          onClick={handleLogout}
                        >
                          {" "}
                          <img
                            src="/exit.png"
                            className=""
                            height={20}
                            width={20}
                            alt=""
                          />
                          Logout{" "}
                        </div>
                      )}
                    </div>
                    {/* Remove Logout from dropdown as per the requirement */}
                  </div>
                )}
              </div>
            </>
          )}
        </ul>
        <div
          className={`menu-btn-1 md:hidden mx-6 z-20 ${
            isActive ? "active" : ""
          } ${router.pathname === "/" ? "block" : "hidden"}`}
          onClick={toggleActive}
        >
          <span></span>
        </div>
      </div>
      {isActive && <HamBurger />}
    </>
  );
};
export default Header;

const HamBurger = () => {
  return (
    <>
      <div className="absolute mt-2 rounded-lg border border-gray-50/20 z-10 bg-gray-50 drop-shadow-2xl backdrop-filter backdrop-blur-[6px] w-[96%] p-2">
        <ul className="list-none gap-12 my-4 text-xs flex flex-col items-center justify-between">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">login</a>
          </li>
          <li>
            <a href="#">Register</a>
          </li>
        </ul>
      </div>
    </>
  );
};
