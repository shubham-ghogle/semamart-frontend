import { AiOutlineCamera } from "react-icons/ai";
import { useUserStore } from "../../store/userStore";
import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { User } from "../../Types/types";
import { ScreenOverlayLoaderUi } from "../../components/UIComponents/LoaderUi";
import Input from "../../components/UIComponents/Inputs";
import { ActionBtn } from "../../components/UIComponents/Buttons";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "@/data";
import { requestEmailChange } from "@/Screens/LoginScreen/EmailChange.Hooks";
import { toast } from "react-toastify";

export default function UserProfileScreen() {
  const { user, addUser } = useUserStore((state) => state);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [hydrated, setHydrated] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Redirect if no user after hydration, using replace:true to avoid history trap
  useEffect(() => {
    if (hydrated && !user) {
      navigate("/login", {
        replace: true, // <-- important: replaces current history entry
        state: { from: location.pathname }, // save intended route
      });
    }
  }, [hydrated, user, navigate, location.pathname]);

  const { mutateAsync: mutateAvatarAsync, status: avatarStatus } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(API_URL+"user/update-avatar", {
        method: "put",
        body: formData,
      });
      const data = (await res.json()) as { success: boolean; user: User };

      if (!res.ok || !data.success) throw new Error();
      return data.user;
    },
    onSuccess: (data) => {
      addUser(data);
    },
  });

  function handleImageClick() {
    imageInputRef.current?.click();
  }

  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    await mutateAvatarAsync(formData);
  }

  async function handleRequestEmailChange() {
    if (!newEmail.trim()) return;
    try {
      setRequestingEmailChange(true);
      await requestEmailChange("user", newEmail.trim());
      setNewEmail("");
      toast.success("Confirmation link sent to your current email.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to request email change.");
    } finally {
      setRequestingEmailChange(false);
    }
  }

  if (!hydrated) return null; // avoid flicker before hydration

  return (
    <>
      <div className="flex justify-center w-full mt-4">
        <div className="relative cursor-pointer">
          <img
            src={
              user && user.avatar
                ? `/baseUrl/${user.avatar}`
                : "/placeholder.png"
            }
            className="w-[150px] h-[150px] rounded-full object-cover border-[3px] border-[#3ad132]"
            alt="profile img"
            onClick={handleImageClick}
          />
          <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center absolute bottom-[5px] right-[5px]">
            <input
              type="file"
              id="image"
              className="hidden"
              ref={imageInputRef}
              onChange={handleImage}
            />
            <AiOutlineCamera />
          </div>
        </div>
      </div>
      <div className="w-full px-5 mt-20">
        <form
          className="flex flex-col justify-center items-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <section className="grid grid-cols-2 w-3/5 mx-auto gap-6 mb-4">
            <Input
              label="First name"
              type="text"
              value={user?.firstName || ""}
              onChange={() => { }}
            />
            <Input
              label="Last name"
              type="text"
              value={user?.lastName || ""}
              onChange={() => { }}
            />
            <Input
              label="Institute name"
              type="text"
              value={user?.instituteName || ""}
              onChange={() => { }}
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ""}
              onChange={() => { }}
            />
            <Input
              label="Phone number"
              type="number"
              value={user?.phoneNumber || ""}
              onChange={() => { }}
            />
          </section>
          <section className="w-3/5 mx-auto mb-4">
            <p className="text-sm text-gray-500 mb-2">
              To change email, request confirmation link on your current email.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleRequestEmailChange}
                disabled={requestingEmailChange}
                className="px-4 py-2 bg-[#1C647C] text-white rounded-md text-sm disabled:opacity-60"
              >
                {requestingEmailChange ? "Sending..." : "Request Email Change"}
              </button>
            </div>
          </section>
          <ActionBtn disabled>Update</ActionBtn>
        </form>
      </div>
      {avatarStatus === "pending" && <ScreenOverlayLoaderUi />}
    </>
  );
}
