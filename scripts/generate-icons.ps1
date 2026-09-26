Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $PSScriptRoot '..\public\icons'
foreach ($size in @(192, 512)) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#247667'))
  $scale = $size / 64.0
  $graphics.ScaleTransform($scale, $scale)
  $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 2.5)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawRectangle($pen, 18, 21, 28, 26)
  $graphics.DrawLine($pen, 25, 17, 25, 25)
  $graphics.DrawLine($pen, 39, 17, 39, 25)
  $graphics.DrawLine($pen, 18, 30, 46, 30)
  $graphics.DrawLine($pen, 25, 36, 28, 36)
  $graphics.DrawLine($pen, 36, 36, 39, 36)
  $graphics.DrawLine($pen, 25, 42, 28, 42)
  $bitmap.Save((Join-Path $iconDirectory "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $pen.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}
