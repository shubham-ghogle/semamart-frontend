import { RouterProvider } from "react-router/dom";
import { router } from "./Routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer hideProgressBar={true} />
    </QueryClientProvider>
  );
}

export default App;
