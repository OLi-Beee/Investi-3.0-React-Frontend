// import { AssistantRuntimeProvider } from "@assistant-ui/react";
// import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
// import { Thread, ThreadList } from "@assistant-ui/react/components";
// import { Box } from "@mui/material";

// export default function AssistantPage() {
//   const runtime = useChatRuntime({
//     api: "http://localhost:3001", // Update this if your backend is deployed elsewhere
//     headers: {
//       Authorization: `Bearer ${import.meta.env.REACT_OPENAI_API_KEY}`, // or process.env.REACT_APP_... for CRA
//     },
//   });

//   return (
//     <AssistantRuntimeProvider runtime={runtime}>
//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: "200px 1fr",
//           gap: 2,
//           height: "100vh",
//           padding: 2,
//           backgroundColor: "#000",
//           color: "#fff",
//         }}
//       >
//         <ThreadList />
//         <Thread />
//       </Box>
//     </AssistantRuntimeProvider>
//   );
// }