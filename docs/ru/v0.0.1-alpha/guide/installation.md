# Установка

GoDyno предлагает несколько способов установки. Выберите тот, который подходит для вашей среды.

## Загрузка бинарного файла
### GitHub Releases

Вы можете загрузить готовый бинарный файл со страницы [релизов](https://github.com/Mad-Pixels/go-dyno/releases) и добавить его в ваш `$PATH`.

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

## Сборка из исходников

Убедитесь, что у вас установлена и настроена поддерживаемая версия [Go](https://go.dev). Минимальная версия указана в файле [go.mod](https://github.com/Mad-Pixels/go-dyno/blob/main/go.mod).

```bash
git clone https://github.com/Mad-Pixels/go-dyno.git
cd go-dyno
go build -o godyno ./cmd/dyno
```

## Использование Docker

Вы так же можете использовать [Docker-образ](https://hub.docker.com/r/madpixels/go-dyno).

![Docker](https://img.shields.io/badge/Docker-amd64%20%7C%20arm64-2496ED?logo=docker&logoColor=white)
```bash
docker pull madpixels/go-dyno:latest

docker run --rm -v $(pwd):/workspace \
     madpixels/go-dyno gen           \
     --cfg /workspace/schema.json    \
     --dst /workspace/generated
```
