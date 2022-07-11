import React from "react";
import { NativeBaseProvider } from "native-base";
import Screen1 from "./Screen1";

export default function App() {
  return (
    <NativeBaseProvider>
      <Screen1 />
    </NativeBaseProvider>
  );
}
