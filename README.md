# Courtside

A mobile app for pickleball players to find and sign up for sessions across all the groups and clubs they belong to.

**Team:** Sam Bryan, Khushi Shah, Vinci Li, Rishi Raj

## Tasks

1. **Join a waitlist:** Find → tap **Fri** → *Friday Night Open Play (Int/Adv)* is full → **Join waitlist**.
2. **Cancel a session:** My Sessions → **Cancel** on a session → confirm.
3. **Register and add to calendar:** Find → **Register** on an open session → confirm → **Add to calendar**.

You can also join a group with a code (try **CRCBEG** or **MPLMIX**) from Find or Profile.

## Run it on an iPhone

1. Install **Expo Go** on the iPhone from the App Store.
2. On the laptop, run:
   ```bash
   cd courtside
   npm install
   npx expo start
   ```
3. Scan the QR code with the iPhone camera.

If the phone can't connect, run `npx expo start --tunnel` instead.

To start fresh between testers, go to **Profile → Reset prototype data**.
