import React from "react";
import { Box, Button } from "native-base";
import Screen2 from "./Screen2";

export default function Screen1() {
  const [screen2, setScreen2] = React.useState(false);
  const clsch = "red";
  return (
    <Box>
      <Button colorScheme={clsch} onPress={() => setScreen2(!screen2)}>
        Mount/Unmount Screen2
      </Button>
      {screen2 && <Screen2 />}
    </Box>
  );
}
