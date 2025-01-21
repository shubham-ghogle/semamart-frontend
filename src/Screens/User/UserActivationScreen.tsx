import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

export default function UserActivationScreen() {
  const { token } = useParams();

  const { status } = useQuery({
    queryFn: async () => {
      if (!token) throw new Error();

      const res = await fetch("/api/v2/user/activation", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activation_token: token }),
      });
      if (!res.ok) throw new Error();
      return await res.json();
    },
    queryKey: ["activation_token"],
    gcTime: 0,
    retry: 0,
  });

  return (
    <div>
      {status === "error" && <p>Error</p>}
      {status === "pending" && <p>Loading...</p>}
      {status === "success" && <p>hello</p>}
    </div>
  );
}
