import asyncio
import json
import sys
import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Add the root DevMatrixx folder to Python path so we can import the 'ml' module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# IMPORTANT: Add the ml folder directly so SB3 can unpickle the model properly
ml_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml"))
if ml_dir not in sys.path:
    sys.path.insert(0, ml_dir)

import agent_model
from ml.inference import InferenceRunner

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Absolute path to the golden brain we baked overnight
CHECKPOINT_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "ml",
        "checkpoints",
        "OVERNIGHT_BAKE_20260413_004249_best",
        "best_model.zip"
    )
)

@app.get("/")
async def root():
    return {"status": "ok", "model": CHECKPOINT_PATH}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket client connected!")
    
    try:
        print("🔄 Initializing InferenceRunner...")
        # Initialize the live AI runner using the real 15x15 environment
        runner = InferenceRunner(
            checkpoint_path=CHECKPOINT_PATH,
            grid_size=15,
            max_steps=200,
            use_real_env=True,
            step_delay=0.05  # 50ms delay for faster animation
        )
        print("✅ InferenceRunner initialized!")
        
        runner.env.curriculum.current_stage = 3
        print(f"🎓 Forced environment to Stage {runner.env.curriculum.current_stage}")
        
        episode_count = 0
        while True:
            try:
                episode_count += 1
                print(f"\n🎬 Episode {episode_count} starting...")
                # run_episode is an async generator that yields the get_state() JSON dict!
                step_count = 0
                async for state in runner.run_episode():
                    step_count += 1
                    await websocket.send_json(state)
                
                print(f"✅ Episode {episode_count} finished ({step_count} steps)")
                # Quick pause before the AI starts a brand new episode
                await asyncio.sleep(1.0)
            except Exception as ep_error:
                print(f"❌ Error in episode {episode_count}: {ep_error}")
                import traceback
                traceback.print_exc()
                break
            
    except WebSocketDisconnect:
        print("Frontend disconnected from WebSocket.")
    except Exception as e:
        print(f"❌ Critical error in WebSocket: {e}")
        import traceback
        traceback.print_exc()

