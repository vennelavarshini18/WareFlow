# 🤖 WAREHOUSE RL UI — SETUP & RUN GUIDE

## What's Ready
✅ **Backend**: FastAPI WebSocket server with your trained model  
✅ **Frontend**: React + Three.js 3D visualization  
✅ **Environment**: ML1's real WarehouseEnv with obstacles  
✅ **Model**: `OVERNIGHT_BAKE` (2M steps, Stages 1→2→3 trained)  

---

## 🎯 What's Been Updated

The backend (`backend/main.py`) now **forces Stage 2** to test your model with obstacles:

```python
# Forced to Stage 2 (obstacles) — Change this if you want:
# - Stage 1: Empty room (no obstacles)
# - Stage 2: Obstacles (forklifts, random walkers, patrol robots) ✅ CURRENT
# - Stage 3: Obstacles + competing robots racing to the goal

runner.env.curriculum.current_stage = 2
```

---

## 📦 Step 1: Install Dependencies

### Backend (one-time setup)
```powershell
cd DevMatrixx\backend
pip install fastapi uvicorn[standard] websockets
```

### ML dependencies (if not already done)
```powershell
pip install gymnasium numpy stable-baselines3[extra] torch
```

### Frontend (one-time setup)
```powershell
cd DevMatrixx\frontend
npm install
```

---

## 🚀 Step 2: Run the System (2 Terminal Windows)

### Terminal 1: Backend (WebSocket Server)
```powershell
cd DevMatrixx\backend
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

The backend is now serving your model at `ws://localhost:8000/ws`

### Terminal 2: Frontend (React Dev Server)
```powershell
cd DevMatrixx\frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🌐 Step 3: Open the UI

Open your browser and go to:
```
http://localhost:5173
```

**You should see:**
- 3D warehouse environment
- Robot (agent) in red
- Goal (target) in green/gold
- **Obstacles in gray** (forklifts, random walkers, moving robots)
- Real-time metrics at the bottom

---

## 🧪 Test Different Difficulty Levels

Edit `backend/main.py` at line ~63 to test different stages:

### 🟢 Stage 1: Empty Room (Baseline)
```python
runner.env.curriculum.current_stage = 1  # No obstacles, just agent + goal
```

### 🟡 Stage 2: With Obstacles (CURRENT)
```python
runner.env.curriculum.current_stage = 2  # ✅ Forklifts, random walkers
```

### 🔴 Stage 3: With Competing Robots (Hardest)
```python
runner.env.curriculum.current_stage = 3  # Obstacles + 2 other robots racing for the goal!
```

Then **refresh the browser** or reconnect to see the new stage.

---

## 📊 What to Look For

### ✅ Good Performance (Model is learning!)
- Robot reaches goal quickly
- Avoids obstacles
- Green circle appears at goal location
- Success rate shown at bottom

### ⚠️ Issues
- Robot gets stuck: May need Stage 1 testing first
- Hitting obstacles: Model wasn't trained extensively on Stage 2
- Feedback: Watch TensorBoard to see training curves

---

## 📈 Monitor Training Metrics

TensorBoard logs are in `ml/tb_logs/`:

```powershell
tensorboard --logdir ml/tb_logs
```

Then open `http://localhost:6006` in another browser tab.

---

## 🔧 Customization Options

In `backend/main.py`, you can tweak:

```python
runner = InferenceRunner(
    checkpoint_path=CHECKPOINT_PATH,
    grid_size=15,           # Grid size (15x15 = default training)
    max_steps=200,          # Max steps per episode
    use_real_env=True,      # ML1 real env (True) or dummy (False)
    step_delay=0.1          # Delay between steps (0.1 = 100ms) — increase for slower animation
)
```

---

## ❌ Troubleshooting

### "ModuleNotFoundError: No module named 'ml1'"
- Make sure you're running from `DevMatrixx\backend\`
- Check `backend/main.py` line 7 adds the parent folder to `sys.path`

### "Connection refused" in UI
- Backend not running? Check Terminal 1
- Is `http://127.0.0.1:8000` responding?

### "Checkpoint not found"
- Path is wrong? Check line 35 in `backend/main.py` — should point to:
  ```
  ml/checkpoints/OVERNIGHT_BAKE_20260413_004249_best/best_model.zip
  ```

### UI shows black screen
- Frontend not compiled? Run `npm run dev` with no errors
- WebSocket not connecting? Check browser DevTools Console

---

## 🎬 Next Steps

1. **Stage 1 test**: Verify model works in empty room  
2. **Stage 2 test**: Check obstacle avoidance  
3. **Stage 3 test**: Watch it compete with other robots!  
4. **Collect metrics**: Use TensorBoard to analyze performance  
5. **Iterate**: Use this data to decide on more training

---

**Questions? Check the model training logs or run:**

```powershell
# Verify model loads correctly
python -c "from stable_baselines3 import PPO; m = PPO.load('ml/checkpoints/OVERNIGHT_BAKE_20260413_004249_best/best_model.zip'); print('✅ Model loaded!')"
```

Happy testing! 🚀
