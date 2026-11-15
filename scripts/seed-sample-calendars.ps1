$key = $env:CAC_API_KEY
if (-not $key) { throw "Set CAC_API_KEY" }
$base = "https://us-central1-christmas-advent-ure-calendar.cloudfunctions.net/api"
$headers = @{ "X-Api-Key" = $key; "Content-Type" = "application/json" }
$year = 2026

function New-Calendar($title, $days) {
  $createBody = @{ title = $title; year = $year } | ConvertTo-Json
  $created = Invoke-RestMethod -Uri "$base/v1/calendars" -Method POST -Headers $headers -Body $createBody
  $slug = $created.calendar.slug
  $bulkBody = @{ days = $days } | ConvertTo-Json -Depth 5
  $result = Invoke-RestMethod -Uri "$base/v1/calendars/$slug/days" -Method PUT -Headers $headers -Body $bulkBody
  [PSCustomObject]@{ Title = $title; Slug = $slug; Days = $result.days.Count }
}

# Slugs must stay in sync with src/lib/stockCalendars.ts when re-seeding.
$calendars = @(
  @{
    Title = "Cozy December Classics"
    Days = @(
      @{ dayNumber = 1; title = "Season starts"; message = "Light a candle or turn on soft lights. Share one thing you're looking forward to this month." }
      @{ dayNumber = 2; title = "Cocoa calm"; message = "Make hot drinks and sit together for ten quiet minutes with no phones." }
      @{ dayNumber = 3; title = "Winter playlist"; message = "Add songs that feel like December to a shared playlist and play it tonight." }
      @{ dayNumber = 4; title = "Thank-you moment"; message = "Send or say thanks to someone who made your year brighter." }
      @{ dayNumber = 5; title = "Cookie dough day"; message = "Mix cookie dough to chill. Let anticipation be part of the fun." }
      @{ dayNumber = 6; title = "Lights stroll"; message = "Walk or drive to enjoy neighborhood lights at an easy pace." }
      @{ dayNumber = 7; title = "Story evening"; message = "Read a holiday book aloud or swap favorite winter memories." }
      @{ dayNumber = 8; title = "Simple crafts"; message = "Make paper snowflakes or a paper chain for a doorway." }
      @{ dayNumber = 9; title = "Game night"; message = "Play a card or board game with snacks and relaxed rules." }
      @{ dayNumber = 10; title = "Bake and share"; message = "Bake cookies and set a few aside for a friend or neighbor." }
      @{ dayNumber = 11; title = "Photo memories"; message = "Look through old winter photos and pick one to display." }
      @{ dayNumber = 12; title = "Soup night"; message = "Cook a comforting soup and bread for an unhurried dinner." }
      @{ dayNumber = 13; title = "Quiet kindness"; message = "Do one small helpful act without announcing it." }
      @{ dayNumber = 14; title = "Movie night"; message = "Watch a seasonal favorite with blankets and popcorn." }
      @{ dayNumber = 15; title = "Decorate a corner"; message = "Refresh one small space with something festive." }
      @{ dayNumber = 16; title = "Puzzle time"; message = "Work on a puzzle together for half an hour." }
      @{ dayNumber = 17; title = "Special breakfast"; message = "Make breakfast feel special with a favorite morning treat." }
      @{ dayNumber = 18; title = "Gratitude slips"; message = "Everyone writes one gratitude and adds it to a jar or bowl." }
      @{ dayNumber = 19; title = "Tidy with music"; message = "Tidy a shared space together while music plays." }
      @{ dayNumber = 20; title = "Fireside check-in"; message = "Share a highlight from the year over tea or cocoa." }
      @{ dayNumber = 21; title = "Wrap station"; message = "Organize gifts and wrapping so the big days feel easier." }
      @{ dayNumber = 22; title = "Breakfast for dinner"; message = "Keep dinner simple and playful: breakfast at night." }
      @{ dayNumber = 23; title = "Ready gently"; message = "Lay out what you need for tomorrow and rest early if you can." }
      @{ dayNumber = 24; title = "Christmas Eve"; message = "Favorite traditions, simple food, and time together." }
    )
  }
  @{
    Title = "Maximum Holiday Chaos"
    Days = @(
      @{ dayNumber = 1; title = "GO TIME"; message = "Blast one holiday banger and do a silly victory lap. December mode: ON." }
      @{ dayNumber = 2; title = "Cocoa showdown"; message = "Hot chocolate towers. Tallest foam wins. Loser picks tomorrow's snack." }
      @{ dayNumber = 3; title = "Kitchen dance riot"; message = "Five-minute dance break. Bad moves = bonus points." }
      @{ dayNumber = 4; title = "Compliment ambush"; message = "Hit someone with an overly specific compliment, then disappear." }
      @{ dayNumber = 5; title = "Cookie speed run"; message = "Race to mix dough before the timer ends. Flour explosions acceptable." }
      @{ dayNumber = 6; title = "Light patrol"; message = "Rate neighborhood lights from 'cute' to 'full spectacle.' Crown a champ." }
      @{ dayNumber = 7; title = "Drama story hour"; message = "Tell a holiday tale; everyone adds one ridiculous plot twist." }
      @{ dayNumber = 8; title = "Craft explosion"; message = "Snowflake factory: weird shapes welcome. Tape them everywhere." }
      @{ dayNumber = 9; title = "Game gauntlet"; message = "Three quick rounds of cards or charades. Winner picks couch rules." }
      @{ dayNumber = 10; title = "Legendary cookies"; message = "Bake cookies and call them legendary before the first bite. Confidence = flavor." }
      @{ dayNumber = 11; title = "Throwback roast"; message = "Old photos: best winter outfit roast, kind edition only." }
      @{ dayNumber = 12; title = "Soup with commentary"; message = "Cook soup like a TV chef. Score based on flair, not accuracy." }
      @{ dayNumber = 13; title = "Secret joy drop"; message = "Leave a tiny surprise for someone. Ghost mode activated." }
      @{ dayNumber = 14; title = "Movie gasp sync"; message = "Holiday movie night: synchronized gasps at plot twists mandatory." }
      @{ dayNumber = 15; title = "Deco takeover"; message = "One room. All the festive energy it can handle. Possibly more." }
      @{ dayNumber = 16; title = "Puzzle brawl"; message = "30-minute puzzle sprint. Trickiest piece earns Chief Brawler title." }
      @{ dayNumber = 17; title = "Breakfast blitz"; message = "Festive breakfast event: shapes, syrup art, pajama uniforms." }
      @{ dayNumber = 18; title = "Gratitude mic drop"; message = "Gratitude speeches with dramatic acceptance energy." }
      @{ dayNumber = 19; title = "Tidy turbo"; message = "15-minute tidy blitz with hype playlist. Coziest blanket to the winner." }
      @{ dayNumber = 20; title = "Memory highlight reel"; message = "Funniest good memory of the year. Snort-laugh attempts encouraged." }
      @{ dayNumber = 21; title = "Wrap battle"; message = "Speed wrap with questionable bow technique. Most chaotic wrap wins." }
      @{ dayNumber = 22; title = "Plot twist dinner"; message = "Breakfast for dinner. Pajamas early. No explanations needed." }
      @{ dayNumber = 23; title = "Eve-eve hype"; message = "Prep with music up: snacks staged, countdown energy high." }
      @{ dayNumber = 24; title = "FINALE"; message = "Big night energy: favorites, food, one last hype moment. MVP status unlocked." }
    )
  }
  @{
    Title = "Kindness Countdown"
    Days = @(
      @{ dayNumber = 1; title = "Start with thanks"; message = "Thank three people today—out loud, text, or note." }
      @{ dayNumber = 2; title = "Doorway delight"; message = "Hold a door, offer a smile, or help carry something for someone." }
      @{ dayNumber = 3; title = "Encouragement note"; message = "Leave a sticky note of encouragement where someone will find it." }
      @{ dayNumber = 4; title = "Pantry helper"; message = "Donate a few pantry items if you can, or share extras with a neighbor." }
      @{ dayNumber = 5; title = "Bake to share"; message = "Bake something simple and give a portion away." }
      @{ dayNumber = 6; title = "Cheer for lights"; message = "Tell a neighbor their lights look great (even if they're minimal)." }
      @{ dayNumber = 7; title = "Story of giving"; message = "Read or tell a story about generosity. Discuss one takeaway." }
      @{ dayNumber = 8; title = "Cards for helpers"; message = "Make cards for teachers, cashiers, or helpers you appreciate." }
      @{ dayNumber = 9; title = "Include someone"; message = "Invite someone shy or new into your game, chat, or meal." }
      @{ dayNumber = 10; title = "Treat delivery"; message = "Drop off a small treat or note to someone nearby." }
      @{ dayNumber = 11; title = "Memory gift"; message = "Share an old photo or memory with the person in it." }
      @{ dayNumber = 12; title = "Soup for sharing"; message = "Make extra soup and send a portion to a friend or family member." }
      @{ dayNumber = 13; title = "Secret cleanup"; message = "Quietly tidy or improve a shared space for others." }
      @{ dayNumber = 14; title = "Comfort movie"; message = "Watch something heartwarming and discuss who you'd recommend it to." }
      @{ dayNumber = 15; title = "Decorate for all"; message = "Add something festive others will enjoy in a shared area." }
      @{ dayNumber = 16; title = "Puzzle together"; message = "Invite someone to puzzle time—even ten minutes counts." }
      @{ dayNumber = 17; title = "Breakfast invite"; message = "Make breakfast a little nicer for everyone at home today." }
      @{ dayNumber = 18; title = "Gratitude gifts"; message = "Everyone names one person to appreciate and why." }
      @{ dayNumber = 19; title = "Help without asking"; message = "Spot a chore and do it before being asked." }
      @{ dayNumber = 20; title = "Listen long"; message = "Give someone extra time to talk with no rushing." }
      @{ dayNumber = 21; title = "Wrap with care"; message = "Wrap gifts thoughtfully; add a handwritten line inside the tag." }
      @{ dayNumber = 22; title = "Easy night"; message = "Keep the evening calm so everyone can recharge." }
      @{ dayNumber = 23; title = "Welcome tomorrow"; message = "Prepare to host or share space graciously tomorrow." }
      @{ dayNumber = 24; title = "Christmas Eve heart"; message = "Focus on presence over perfection. Say what you're grateful for." }
    )
  }
  @{
    Title = "Budget-Friendly December"
    Days = @(
      @{ dayNumber = 1; title = "Free forecast"; message = "List free things you enjoy in winter. Pick one for later this month." }
      @{ dayNumber = 2; title = "Pantry cocoa"; message = "Cocoa from what you have. Fancy it up with cinnamon or a dash of vanilla." }
      @{ dayNumber = 3; title = "Library or home tunes"; message = "Stream free holiday music or borrow CDs if your library still rocks those." }
      @{ dayNumber = 4; title = "Text gratitude"; message = "Three thank-you texts cost nothing and land big." }
      @{ dayNumber = 5; title = "Simple cookies"; message = "Sugar cookies or box mix—decorate with what you already own." }
      @{ dayNumber = 6; title = "Lights on foot"; message = "Free light tour: walk your neighborhood after dark." }
      @{ dayNumber = 7; title = "Story swap"; message = "Borrow a library book or retell a classic from memory." }
      @{ dayNumber = 8; title = "Repurpose crafts"; message = "Craft from scrap paper, old cards, or cardboard. Zero new supplies." }
      @{ dayNumber = 9; title = "Homemade games"; message = "Charades, 20 questions, or pencil-and-paper games." }
      @{ dayNumber = 10; title = "Share the batch"; message = "Split a cheap bake into small portions to gift." }
      @{ dayNumber = 11; title = "Digital album"; message = "Scroll old phone photos and make a free digital slideshow." }
      @{ dayNumber = 12; title = "Rice and beans glow-up"; message = "Dress up a pantry staple with spices and call it chef's choice." }
      @{ dayNumber = 13; title = "Help swap"; message = "Offer a favor instead of a gift: babysit, pet walk, or errand." }
      @{ dayNumber = 14; title = "Streaming night"; message = "Free trial or library streaming—pick one movie together." }
      @{ dayNumber = 15; title = "Redecorate free"; message = "Rearrange what you own into a new festive display." }
      @{ dayNumber = 16; title = "Thrift puzzle"; message = "Finish a puzzle you already own or trade with a friend." }
      @{ dayNumber = 17; title = "Oatmeal parade"; message = "Fancy oatmeal with toppings from the cupboard." }
      @{ dayNumber = 18; title = "Gratitude list"; message = "Paper list of gratitudes—no app required." }
      @{ dayNumber = 19; title = "Declutter donation"; message = "Bag items to donate. Clears space, helps others." }
      @{ dayNumber = 20; title = "At-home fireside"; message = "Candle or LED lights, hot drink, conversation." }
      @{ dayNumber = 21; title = "Newspaper wrap"; message = "Wrap with maps, comics, or brown paper if you have it." }
      @{ dayNumber = 22; title = "Eggs for dinner"; message = "Cheap, fast, cheerful: omelets or scrambled eggs night." }
      @{ dayNumber = 23; title = "Prep cheap eats"; message = "Plan simple food for busy days ahead." }
      @{ dayNumber = 24; title = "Simple Eve"; message = "Low-cost traditions: stories, lights you own, being together." }
    )
  }
  @{
    Title = "Winter Adventure Squad"
    Days = @(
      @{ dayNumber = 1; title = "Mission briefing"; message = "December squad assembles! Pick your team name and first mini adventure." }
      @{ dayNumber = 2; title = "Trail mix lab"; message = "Build custom snack mixes for on-the-go exploring." }
      @{ dayNumber = 3; title = "Scavenger walk"; message = "Walk and spot: red, green, star shape, twinkle lights. Snap mental photos." }
      @{ dayNumber = 4; title = "Park play"; message = "Bundle up for 20 minutes at a park or yard—run, toss, or sled if you can." }
      @{ dayNumber = 5; title = "Fort build"; message = "Blanket fort HQ. Plans discussed inside are classified." }
      @{ dayNumber = 6; title = "Night expedition"; message = "After-dark walk with flashlights to see winter differently." }
      @{ dayNumber = 7; title = "Campfire story"; message = "Outdoor fire or LED 'campfire' indoors. Stories required." }
      @{ dayNumber = 8; title = "Nature art"; message = "Collect pinecones or sticks (where allowed) and craft something wild." }
      @{ dayNumber = 9; title = "Backyard olympics"; message = "Three silly stations: toss, balance, speed walk. Medals optional." }
      @{ dayNumber = 10; title = "Picnic inside"; message = "Picnic blanket on the floor. Adventure fuel: sandwiches and fruit." }
      @{ dayNumber = 11; title = "Map the hood"; message = "Draw a map of favorite spots nearby and visit one." }
      @{ dayNumber = 12; title = "Thermos hike"; message = "Short walk with hot drinks in travel mugs." }
      @{ dayNumber = 13; title = "Bird watch"; message = "Five minutes watching birds or sky. Log what you see." }
      @{ dayNumber = 14; title = "Adventure film"; message = "Nature or exploration doc—plan a dream trip for fun." }
      @{ dayNumber = 15; title = "Gear check"; message = "Gather hats, gloves, layers. Ready squad = happy squad." }
      @{ dayNumber = 16; title = "Obstacle course"; message = "Couch-cushion course in the living room. Timer optional." }
      @{ dayNumber = 17; title = "Sunrise or sunset"; message = "Catch dawn or dusk together with a warm drink." }
      @{ dayNumber = 18; title = "Squad shout-outs"; message = "Each person names a teammate strength they admire." }
      @{ dayNumber = 19; title = "Clean base camp"; message = "Quick tidy so HQ is adventure-ready again." }
      @{ dayNumber = 20; title = "Year expedition"; message = "Best outdoor or active memory of the year—retell it like a documentary." }
      @{ dayNumber = 21; title = "Gift drop trek"; message = "Walk to deliver a gift or note on foot if safe." }
      @{ dayNumber = 22; title = "Recovery rations"; message = "Easy comfort food after a busy season week." }
      @{ dayNumber = 23; title = "Eve recon"; message = "Check weather, routes, and plans for tomorrow's adventures." }
      @{ dayNumber = 24; title = "Squad finale"; message = "Big day walk, yard games, or cozy squad debrief—you choose the mission." }
    )
  }
)

$results = foreach ($cal in $calendars) {
  New-Calendar -title $cal.Title -days $cal.Days
}

$results | Format-Table -AutoSize
$results | ForEach-Object {
  Write-Host "$($_.Title): https://christmasadventurecalendar.com/c/$($_.Slug)"
}