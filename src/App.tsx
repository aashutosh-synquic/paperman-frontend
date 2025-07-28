"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";
import { Button } from "./components/ui/button";
import Users from "./pages/users";
import AuthPage from "./pages/authpage";

export default function App() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <h1>Test</h1>
      <Button variant={"default"}>Click Me</Button>
      <br />
      <Button variant={"destructive"}>Click to Cancel</Button>
      <br />
      <AuthPage />
      <br />
      <h2>Progress Bar</h2>
      <Progress value={progress} className="w-[60%]" />
      <Users />
    </>
  );
}
