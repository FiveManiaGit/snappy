# Simple script to build the app to all supported platforms

echo "Snappy Build Script"
echo "Building Linux x64..."
yarn dist -l --x64
echo "Building Linux x86_64..."
yarn dist -l --ia32
echo "Building Linux armhf..."
yarn dist -l --armv7l
echo "Building Linux arm64..."
yarn dist -l --arm64
echo "Building macOS..."
yarn dist -m
echo "Building Windows x64..."
yarn dist -w --x64
echo "Building Windows x86_64..."
yarn dist -w --ia32