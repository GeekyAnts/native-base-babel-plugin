import React from "react";
import {
  Alert,
  HStack,
  VStack,
  Text,
  IconButton,
  CloseIcon,
  Box,
  NativeBaseProvider,
} from "native-base";

export default function Screen2() {
  return (
    <NativeBaseProvider>
      <Alert maxW="400" status="info" colorScheme="info">
        <VStack space={2} flexShrink={1} w="100%">
          <HStack
            flexShrink={1}
            space={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <HStack flexShrink={1} space={2} alignItems="center">
              <Alert.Icon />
              <Text fontSize="md" fontWeight="medium" color="coolGray.800">
                We are going live in July!
              </Text>
            </HStack>
            <IconButton
              variant="unstyled"
              _focus={{
                borderWidth: 0,
              }}
              icon={<CloseIcon size="3" />}
              _icon={{
                color: "coolGray.600",
              }}
            />
          </HStack>
          <Box
            pl="6"
            _text={{
              color: "coolGray.600",
            }}
          >
            We are happy to announce that we are going live on July 28th. Get
            ready!
          </Box>
        </VStack>
      </Alert>
    </NativeBaseProvider>
  );
}
