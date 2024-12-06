# Caminho da pasta de destino 
$destPath = ".\types"

# Verifica se a pasta 'types' existe; caso contrário, cria a pasta
# Remove a pasta 'types' se ela existir
if (Test-Path -Path $destPath) {
    Remove-Item -Path $destPath -Recurse -Force
}

#cria a pasta
New-Item -Path $destPath -ItemType Directory


# Caminho da pasta de origem
$sourcePath = ".\"


# Array de diretórios a serem excluídos
$excludeDirs = @("node_modules", "bin", "dist","log","test","doc","types")

# Copia todos os arquivos .d.ts da pasta de origem e subpastas para a pasta 'types'
Get-ChildItem -Path $sourcePath -Recurse -Include *.d.ts | ForEach-Object {
    # Calcula o caminho relativo corretamente
    $relativePath = Resolve-Path $_.FullName | ForEach-Object { $_.Path.Replace((Resolve-Path $sourcePath).Path, "").TrimStart('\') }

    # Cria o caminho de destino mantendo a estrutura de subdiretórios
    $destinationPath = Join-Path $destPath -ChildPath $relativePath

    # Verifica e cria a estrutura de diretórios de destino, se necessário
    $destinationDir = Split-Path $destinationPath -Parent
    if (!(Test-Path -Path $destinationDir)) {
        New-Item -Path $destinationDir -ItemType Directory -Force | Out-Null
    }

    # Copia o arquivo para o diretório de destino
    Copy-Item -Path $_.FullName -Destination $destinationPath -Force
}

foreach ($dir in $excludeDirs) {
    $fullExcludePath = Join-Path -Path $destPath -ChildPath $dir
    if (Test-Path -Path $fullExcludePath) {
        Remove-Item -Path $fullExcludePath -Recurse -Force
    }
}


Write-Host "Arquivos .d.ts copiados com sucesso para a pasta 'types'."