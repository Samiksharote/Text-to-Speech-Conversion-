from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


st.set_page_config(
    page_title="AI Voice — Text to Speech",
    page_icon="🎙️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
    <style>
      #MainMenu, footer, header { visibility: hidden; }
      [data-testid="stAppViewContainer"] { background: #020617; }
      [data-testid="stMain"] > div { padding: 0 !important; }
      iframe { border: 0; }
    </style>
    """,
    unsafe_allow_html=True,
)

app_html = Path(__file__).parent / "web" / "speech_app.html"
components.html(app_html.read_text(encoding="utf-8"), height=1120, scrolling=True)
