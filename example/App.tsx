import React from "react";
import { NativeBaseProvider } from "native-base";
import Screen1 from "./Screen1";

export default function App() {
  const color = "red";
  return (
    <NativeBaseProvider>
      <Screen1 />
      {/* {Object.keys(theme.colors).map((color: any) => {
        const colorObject = theme.colors[color];
        if (Object.keys(colorObject).length === 10) {
          return (
            `<Box
              m="4"
              p="4"
              borderWidth="1"
              rounded="4"
              borderColor="coolGray.300"
            >
              <Heading>${color}</Heading>
              <HStack space="8">
                ` +
            `${Object.keys(colorObject)
              .map((bgColor) => {
                return (
                  `<Center
                      rounded="3"
                      shadow="4"
                      m="2"
                      boxSize="20"
                      bg={` +
                  `"${color}.${bgColor}"` +
                  `}
                    >
                      ${bgColor}
                    </Center>`
                );
              })
              .join("")}` +
            `
              </HStack>
            </Box>`
          );
        }
      })} */}
      {/* {Object.keys(theme.colors).map((color: any) => {
        const colorObject = theme.colors[color];
        if (Object.keys(colorObject).length === 10) {
          return (
            <Box
              m="4"
              p="4"
              borderWidth="1"
              rounded="4"
              borderColor="coolGray.300"
            >
              <Heading>{color}</Heading>
              <HStack space="8">
                {Object.keys(colorObject).map((bgColor) => {
                  return (
                    <Center
                      rounded="3"
                      shadow="4"
                      m="2"
                      boxSize="20"
                      bg={`${color}.${bgColor}`}
                    >
                      {bgColor}
                    </Center>
                  );
                })}
              </HStack>
            </Box>
          );
        }
      })} */}
    </NativeBaseProvider>
  );
}
