$sourceDir = "C:\Users\470 G3\.gemini\antigravity\brain\280f993e-b0f6-4297-b856-445344339d87"
$destDir = "F:\Mike d drive\Mike Webs\dynamicmike.com\New Multi-Site Github Websites\multisite-github\public\realai-pages\images"

# Create directory if not exists
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir
}

Copy-Item "$sourceDir\uploaded_media_0_1769874872485.png" "$destDir\elite-slide-1.png"
Copy-Item "$sourceDir\uploaded_media_1_1769874872485.png" "$destDir\elite-slide-2.png"
Copy-Item "$sourceDir\uploaded_media_2_1769874872485.png" "$destDir\elite-slide-3.png"
Copy-Item "$sourceDir\uploaded_media_3_1769874872485.png" "$destDir\elite-slide-4.png"
Copy-Item "$sourceDir\uploaded_media_4_1769874872485.png" "$destDir\elite-slide-5.png"

Write-Host "Images moved successfully."
