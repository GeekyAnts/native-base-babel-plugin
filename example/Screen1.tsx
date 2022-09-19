import React from "react";
import { Box, Button } from "native-base";
import Screen2 from "./Screen2";
import Screen3 from "./Screen3";

export default function Screen1() {
  const [screen2, setScreen2] = React.useState(false);
  const [screen3, setScreen3] = React.useState(false);
  const props = {
    bg: "red.300",
    p: 4,
  };
  const clsch = "red";
  return (
    <Box {...props}>
      <Button colorScheme={"red"} onPress={() => setScreen2(!screen2)}>
        Mount/Unmount Screen2
      </Button>
      <Button colorScheme={"red"} onPress={() => setScreen3(!screen3)}>
        Mount/Unmount Screen3
      </Button>
      {screen2 && <Screen2 />}
      {screen3 && <Screen3 />}
    </Box>
  );
}
