# iSurvive
```
                                      __                    
__  _  __ _____    _______    ____   |__|   ____      ____  
\ \/ \/ / \__  \   \_  __ \  /    \  |  |  /    \    / ___\ 
 \     /   / __ \_  |  | \/ |   |  \ |  | |   |  \  / /_/  >
  \/\_/   (____  /  |__|    |___|  / |__| |___|  /  \___  / 
               \/                \/            \/  /_____/  
```

DO NOT TOUCH any of the actual source code of the game, if you do - and then you break it, then it is your problem. :)
- Louis-Emile Ploix

# How to download the game source
1. Click on the `Clone or download` button, then `Download Zip`.
2. If asked where to save the zip file, put it somehwere you can find it gain - maybe make a folder called `iMediaISurviveSRC` on your account.
3. Next find that file on the file explorer and right click it, find the botton labeled `7zip`, hover over it and you should see another panel open. Click on `extract to iSurvive-master/`.
4. Go into this folder, you should see two sub directories: `Osmium` and `iSurvive`. Go into `iSurvive`

# How to change the landscape
1. Pick a seed for you world, make sure it is unique, any number is OK
2. Go to the following web-address: `https://isurvive.netlify.com/isurvive/index.html#<your unique number>?show`
3. You should see random terrain, coloured red and purple
4. Now design the world! Save each file you make into the `assets` folder with the name `<your seed>_<layer>.png`. The layer is how far back it is, you cannot miss a layer, but you can go as far back as you like, eg: `123_0.png, 123_1.png, 123_2.png, 123_3.png` Bear in mind that the world height is always 30 blocks
5. When you are ready remove `?show` from the end of the URL and you should see your world

# How to edit an entity image
## An entity could be the moon, sun or a mob
1. Design the image for your entity
2. Replace the file in `assets` with the name of the entity you want to change with one of the same name, but with your new image

# How to edit an enities meta data
1. Go to data.js
2. Find the segment that looks like this:

```
<mod type name>: {
    width: <number>, height: <number>,
    speed: <number>,
    jumpSize: <number>,
    followRadius: <number>,
    max: <number>,
    chance: <number>,
    theme: [<number>, <number>, <number>],
    message: <string>
}
```
3. Edit each attribute accordingly, more info is available in that file

# How to change the file name of an entity
1. In `assets/assets.js` find the part that looks like so:
```
<name>: {
    path: 'assets/<name>.png'
}
```
2. Change the part between the inverted commas to be the new name

# How to add a mob
Ask me. Because that is much more complex. :) - I will add it here seen, but not yet.