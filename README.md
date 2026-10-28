# AI Voice — Streamlit Text-to-Speech

AI Voice is a Streamlit-hosted app that speaks text using the voices available in each visitor's
browser and device. Speech runs locally in the visitor's browser; no paid API, account, API key, or
speech backend is needed.

## Features

- Enter, preview, and clear text; view word and character counts.
- Filter the browser's real voice list by language and select a voice by its supplied name and
  language code.
- Adjust speaking rate, pitch, and volume.
- Speak, pause, resume, and stop. Long text is split into ordered chunks for playback.
- Home, About, Contact, and Login navigation. Contact opens the visitor's email application.
- Responsive layout for desktop and mobile.

Available voices and speech-synthesis support vary by browser, operating system, and installed
system voices.

## Run locally

Requires Python 3.10 or later.

```powershell
python -m pip install -r requirements.txt
python -m streamlit run streamlit_app.py
```

Open the local URL printed by Streamlit, usually `http://localhost:8501`.

## Deploy globally with GitHub and Streamlit Community Cloud

1. Push this project to a GitHub repository. The repository must include these root-level files
   and folders:
   - `streamlit_app.py`
   - `requirements.txt`
   - `.streamlit/config.toml`
   - `web/speech_app.html`
2. Sign in at [share.streamlit.io](https://share.streamlit.io/) using GitHub and authorize access
   to the repository.
3. Select **Create app**, then choose the repository and branch you pushed.
4. Set **Main file path** to `streamlit_app.py`.
5. Select **Deploy**. Streamlit builds the app from `requirements.txt` and provides a public URL.
6. To publish changes later, commit and push them to the selected GitHub branch; Streamlit Cloud
   will redeploy the app.

The existing Vite source is not the Streamlit Cloud entry point. Streamlit Cloud runs
`streamlit_app.py`; its speech UI is the browser-based app in `web/speech_app.html`.

## Notes

The Login page is informational; account authentication is not configured. The Contact form
opens the visitor's email application and does not send or store messages on a server. Voices
depend on the visitor's browser and device.
