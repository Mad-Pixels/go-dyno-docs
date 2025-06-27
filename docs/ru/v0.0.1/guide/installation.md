# Установка

## Загрузка бинарного файла
Список всех релизов доступен [тут](https://github.com/Mad-Pixels/go-dyno/releases).

![Linux](https://img.shields.io/badge/Linux-Amd64%20%7C%20Arm64-blue?logo=linux&logoColor=white)
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

![macOS](https://img.shields.io/badge/macOS-Intel%20%7C%20Silicon-2496ED?logo=apple&logoColor=white)
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

::: info Требования:
 - Наличие [GoLang](https://go.dev) на локальной машине.  
   _Минимальная версия указана в файле [go.mod](https://github.com/Mad-Pixels/go-dyno/blob/main/go.mod)_
:::

```bash
git clone https://github.com/Mad-Pixels/go-dyno.git
cd go-dyno
go build -o godyno ./cmd/dyno
```
