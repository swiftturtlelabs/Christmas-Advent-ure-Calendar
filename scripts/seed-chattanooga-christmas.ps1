$key = $env:CAC_API_KEY
if (-not $key) { throw "Set CAC_API_KEY" }
$base = "https://us-central1-christmas-advent-ure-calendar.cloudfunctions.net/api"
$headers = @{ "X-Api-Key" = $key; "Content-Type" = "application/json" }
$year = 2026
$title = "Chattanooga Christmas"

# From: Christmas Advent Activities CSV (Dec 1–24, 2026). Day 25 (Christmas Day) is noted on day 24.
$days = @(
  @{ dayNumber = 1; title = "SAU Christmas Tree Lighting"; message = "Southern Adventist University Christmas tree lighting — kick off December on the mountain." }
  @{ dayNumber = 2; title = "Decorate the Tree"; message = "Put on Christmas music and decorate the tree together." }
  @{ dayNumber = 3; title = "Bake Neighborhood Goodies"; message = "Bake treats to share with neighbors." }
  @{ dayNumber = 4; title = "Deliver Neighborhood Goodies"; message = "Deliver yesterday's goodies to neighbors and friends." }
  @{ dayNumber = 5; title = "Christmas on the Mountain"; message = "Christmas on the Mountain — enjoy the festive evening." }
  @{ dayNumber = 6; title = "Burks Live Nativity & Fun Run"; message = "Burks Live Nativity and Christmas Tree Fun Run." }
  @{ dayNumber = 7; title = "Festive Forest & Window Displays"; message = "Visit festive forest displays and peek at holiday windows." }
  @{ dayNumber = 8; title = "CA Band Christmas Concert"; message = "Collegedale Academy Band Christmas concert." }
  @{ dayNumber = 9; title = "Christmas Shopping"; message = "Christmas shopping day — list ready, budget in mind." }
  @{ dayNumber = 10; title = "Nutcracker"; message = "The Nutcracker — enjoy the ballet (or your favorite production)." }
  @{ dayNumber = 11; title = "Make Christmas Cards"; message = "Make Christmas cards — prick-pin style if you like." }
  @{ dayNumber = 12; title = "Hot Chocolate"; message = "Hot chocolate day — cozy cups and toppings." }
  @{ dayNumber = 13; title = "Collegedale Christmas Parade"; message = "Collegedale Christmas Parade — bundle up and cheer." }
  @{ dayNumber = 14; title = "Ice Skating"; message = "Ice skating — rink time for the family." }
  @{ dayNumber = 15; title = "Christmas Dates"; message = "Christmas dates — one-on-one or couple time with a festive twist." }
  @{ dayNumber = 16; title = "IT Christmas Party"; message = "IT Christmas party." }
  @{ dayNumber = 17; title = "American Girl Christmas Party"; message = "American Girl Christmas party." }
  @{ dayNumber = 18; title = "TBD"; message = "To be decided — pick something fun when the day comes." }
  @{ dayNumber = 19; title = "Christmas at the Gaylord Opry?"; message = "Optional: Christmas at the Gaylord Opryland." }
  @{ dayNumber = 20; title = "TBD"; message = "To be decided — pick something fun when the day comes." }
  @{ dayNumber = 21; title = "Celebrate Pop Pop"; message = "Celebrate Pop Pop." }
  @{ dayNumber = 22; title = "Gift Wrapping"; message = "Gift wrapping station — bows, tags, and tidy piles." }
  @{ dayNumber = 23; title = "Drive to Look at Lights"; message = "Drive (or walk) to look at Christmas lights." }
  @{ dayNumber = 24; title = "Christmas at Grandma & Pop Pop's"; message = "Christmas at Grandma & Pop Pop's — Christmas Day is tomorrow!" }
)

$createBody = @{ title = $title; year = $year } | ConvertTo-Json
$created = Invoke-RestMethod -Uri "$base/v1/calendars" -Method POST -Headers $headers -Body $createBody
$slug = $created.calendar.slug
$bulkBody = @{ days = $days } | ConvertTo-Json -Depth 5
$result = Invoke-RestMethod -Uri "$base/v1/calendars/$slug/days" -Method PUT -Headers $headers -Body $bulkBody

Write-Host "Created: $title"
Write-Host "Slug: $slug"
Write-Host "Days: $($result.days.Count)"
Write-Host "Public: https://christmasadventurecalendar.com/c/$slug"
Write-Host "Add this slug to src/lib/stockCalendars.ts"
