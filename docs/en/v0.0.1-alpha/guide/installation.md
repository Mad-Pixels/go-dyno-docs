# Installation

go-dyno offers several installation methods. Choose the one that works best for your environment.

## Get The Binary
### GitHub Releases

You can download the binary from the [releases](https://github.com/Mad-Pixels/go-dyno/releases) page on GitHub and add to your `$PATH`.

![Linux](https://img.shields.io/badge/Linux-amd64%20%7C%20arm64-blue?logo=linux&logoColor=white)
::: code-group
```bash [Linux • amd64]
curl -L https://github.com/Mad-Pixels/go-dyno/releases/latest/download/godyno_linux_amd64 -o godyno
chmod +x godyno
sudo mv godyno /usr/local/bin/
```

```bash [Linux • arm64]
curl -L https://github.com/Mad-Pixels/go-dyno/releases/latest/download/godyno_linux_arm64 -o godyno
chmod +x godyno
sudo mv godyno /usr/local/bin/
```
:::

![macOS](https://img.shields.io/badge/macOS-Intel%20%7C%20Silicon-lightgrey?logo=apple&logoColor=white)
::: code-group
```bash [Darwin • Intel]
curl -L https://github.com/Mad-Pixels/go-dyno/releases/latest/download/godyno_darwin_amd64 -o godyno
chmod +x godyno
sudo mv godyno /usr/local/bin/
```

```bash [Darwin • Silicon]
curl -L https://github.com/Mad-Pixels/go-dyno/releases/latest/download/godyno_darwin_arm64 -o godyno
chmod +x godyno
sudo mv godyno /usr/local/bin/
```
:::

## Build From Source

Ensure that you have a supported version of [Go](https://go.dev) properly installed and setup. You can find the minimum required version of Go in the [go.mod](https://github.com/Mad-Pixels/go-dyno/blob/main/go.mod) file.

```bash
git clone https://github.com/Mad-Pixels/go-dyno.git
cd go-dyno
go build -o godyno ./cmd/dyno
```

## Using Docker

For CI/CD processes you can use [docker image](https://hub.docker.com/r/madpixels/go-dyno).

```bash
docker pull madpixels/go-dyno:latest
```