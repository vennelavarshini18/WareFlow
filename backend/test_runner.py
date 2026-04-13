import sys
sys.path.insert(0, '..')
import traceback
from ml.inference import InferenceRunner
import asyncio

async def test():
    try:
        runner = InferenceRunner(checkpoint_path=r'C:\Users\sahas\New folder\DevMatrixx\ml\checkpoints\OVERNIGHT_BAKE_20260413_004249_best\best_model.zip', grid_size=15, max_steps=200, use_real_env=True, step_delay=0.1)
        async for s in runner.run_episode():
            print('state ok')
            break
    except Exception as e:
        traceback.print_exc()

asyncio.run(test())
