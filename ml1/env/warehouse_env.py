

import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random
from typing import Optional, Dict, Any, List, Tuple

from .core_classes import (
    Agent, Goal,
    StaticObstacle, PatrolObstacle, RandomWalkObstacle,
    CompetingRobot, CurriculumTracker,
)


class WarehouseEnv(gym.Env):
    

    metadata = {"render_modes": ["human", "ansi"], "render_fps": 10}

    
    REWARD_STEP_PENALTY = -0.01
    REWARD_CLOSER_SCALE = 0.1       
    REWARD_WALL_HIT = -1.0
    REWARD_COLLISION = -10.0
    REWARD_GOAL = 100.0
    REWARD_COMPETITOR_STEALS = -15.0   

    
    MAX_STEPS_PER_EPISODE = 200

    
    STAGE2_STATIC = 5
    STAGE2_PATROL = 3
    STAGE2_RANDOM = 2

    
    STAGE3_COMPETITORS = 2

    def __init__(self, grid_size: int = 15, render_mode: Optional[str] = None):
        super().__init__()

        self.grid_size = grid_size
        self.render_mode = render_mode

        
        self.action_space = spaces.Discrete(4)
        self.observation_space = spaces.Box(
            low=0, high=255,
            shape=(3, self.grid_size, self.grid_size),
            dtype=np.uint8,
        )

        
        self.agent = Agent()
        self.goal = Goal()
        self.obstacles: List = []

        
        self.curriculum = CurriculumTracker(window_size=100, advance_threshold=0.90)

<<<<<<< HEAD
=======
        
>>>>>>> e89b63fe399fc0a90331a416aa573fdecf7f63b7
        self.current_step = 0
        self.episode_reward = 0.0
        self.prev_distance = 0
        self.route_stage = "to_shelf"
        self.target_category = ""
        self.delivery_pos = (0, 0)

    

    def reset(self, seed: Optional[int] = None, options: Optional[dict] = None):
        """Reset the environment for a new episode."""
        super().reset(seed=seed)

        self.current_step = 0
        self.episode_reward = 0.0
        self.agent.status = "moving"

<<<<<<< HEAD
        # ── Spawn obstacles based on current curriculum stage ─────────
        if not self.obstacles:
            self._spawn_obstacles()

        # ── Setup 2-stage route: to shelf -> to delivery ──
        occupied = set()
        for obs in self.obstacles:
            occupied.update(obs.occupied_cells)
        
        self.delivery_pos = (self.grid_size - 1, self.grid_size - 1)
        if self.delivery_pos in occupied:
            self.delivery_pos = self._sample_free_position(occupied)

        shelves = [obs for obs in self.obstacles if getattr(obs, "category", None) is not None]
        if shelves:
            target_shelf = random.choice(shelves)
            shelf_cells = target_shelf.occupied_cells
            adjacent_cells = set()
            for cx, cy in shelf_cells:
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < self.grid_size and 0 <= ny < self.grid_size:
                        adjacent_cells.add((nx, ny))
            
            free_adjacent = list(adjacent_cells - occupied)
            if not free_adjacent:
                goal_pos = self._sample_free_position(occupied)
            else:
                goal_pos = random.choice(free_adjacent)
            
            self.target_category = target_shelf.category
        else:
            goal_pos = self._sample_free_position(occupied)
            self.target_category = "Unknown"

        self.goal.x, self.goal.y = goal_pos
        self.route_stage = "to_shelf"
        
        if not getattr(self, "agent_spawned", False):
            agent_pos = self._sample_free_position(occupied.union({goal_pos, self.delivery_pos}))
            occupied.add(agent_pos)
            self.agent.set_position(*agent_pos)
            self.agent_spawned = True
=======
        positions = self._sample_unique_positions(2)
        self.agent.set_position(*positions[0])
        self.goal.x, self.goal.y = positions[1]

        self._spawn_obstacles()
>>>>>>> e89b63fe399fc0a90331a416aa573fdecf7f63b7

        self.prev_distance = self._manhattan_distance()

        obs = self._build_observation()
        info = self._build_info()

        return obs, info

    

    def step(self, action: int):
        
        self.current_step += 1
        reward = 0.0
        terminated = False
        truncated = False

        
        new_x, new_y = self.agent.move(action, self.grid_size)

        
        if new_x < 0 or new_x >= self.grid_size or new_y < 0 or new_y >= self.grid_size:
            reward += self.REWARD_WALL_HIT
            self.agent.status = "blocked"
            
        else:
<<<<<<< HEAD
            # ── 3. Check obstacle collision ──────────────────────────
            obstacle_positions = set()
            for obs in self.obstacles:
                obstacle_positions.update(obs.occupied_cells)
            
=======
            
            obstacle_positions = {(obs.x, obs.y) for obs in self.obstacles}
>>>>>>> e89b63fe399fc0a90331a416aa573fdecf7f63b7
            if (new_x, new_y) in obstacle_positions:
                reward += self.REWARD_COLLISION
                self.agent.status = "collided"
                terminated = True
            else:
                
                self.agent.set_position(new_x, new_y)
                self.agent.status = "moving"

                
                if self.agent.x == self.goal.x and self.agent.y == self.goal.y:
                    if self.route_stage == "to_shelf":
                        # Stage 1 complete! Now deliver.
                        reward += self.REWARD_GOAL / 2.0
                        self.route_stage = "to_delivery"
                        self.goal.x, self.goal.y = self.delivery_pos
                        self.prev_distance = self._manhattan_distance()
                    else:
                        # Final destination complete
                        reward += self.REWARD_GOAL
                        self.agent.status = "reached_goal"
                        terminated = True

        
        if not terminated:
            current_distance = self._manhattan_distance()
            delta = self.prev_distance - current_distance  
            reward += delta * self.REWARD_CLOSER_SCALE
            self.prev_distance = current_distance

        
        reward += self.REWARD_STEP_PENALTY

        
        self._update_obstacles()

        
        if not terminated:
            obstacle_positions_after = set()
            for obs in self.obstacles:
                obstacle_positions_after.update(obs.occupied_cells)
                
            if (self.agent.x, self.agent.y) in obstacle_positions_after:
                reward += self.REWARD_COLLISION
                self.agent.status = "collided"
                terminated = True

        
        if not terminated:
            for obs in self.obstacles:
                if isinstance(obs, CompetingRobot) and obs.reached_goal:
                    reward += self.REWARD_COMPETITOR_STEALS
                    self.agent.status = "goal_stolen"
                    terminated = True
                    break

        
        if self.current_step >= self.MAX_STEPS_PER_EPISODE and not terminated:
            truncated = True

        
        if terminated or truncated:
            success = (self.agent.status == "reached_goal")
            self.curriculum.record(success)
            self.curriculum.try_advance()

       
        self.episode_reward += reward

        obs = self._build_observation()
        info = self._build_info()

        if self.render_mode == "human":
            self.render()

        return obs, reward, terminated, truncated, info

    

    def _build_observation(self) -> np.ndarray:
        
        obs = np.zeros((3, self.grid_size, self.grid_size), dtype=np.uint8)

        # Channel 0: Obstacles
        for obstacle in self.obstacles:
            for cell in obstacle.occupied_cells:
                if 0 <= cell[0] < self.grid_size and 0 <= cell[1] < self.grid_size:
                    obs[0, cell[1], cell[0]] = 255

        # Channel 1: Agent
        obs[1, self.agent.y, self.agent.x] = 255

        # Channel 2: Goal
        obs[2, self.goal.y, self.goal.x] = 255

        return obs

    

    def _manhattan_distance(self) -> int:
        return abs(self.agent.x - self.goal.x) + abs(self.agent.y - self.goal.y)

    def _build_info(self) -> Dict[str, Any]:
        
        return {
            "stage": self.curriculum.current_stage,
            "success_rate": round(self.curriculum.success_rate, 4),
            "agent_pos": [self.agent.x, self.agent.y],
            "goal_pos": [self.goal.x, self.goal.y],
            "distance_to_goal": self._manhattan_distance(),
            "obstacles": [obs.to_dict() for obs in self.obstacles],
            "episode_step": self.current_step,
            "total_episodes": self.curriculum.total_episodes,
        }

    

    def _spawn_obstacles(self):
<<<<<<< HEAD
        """Populate the static warehouse shelf layout (always active)."""
        self.obstacles = []

        categories = [
            "Skincare", "Grocery", "Footwear", "Clothes",
            "Pharmacy", "Electronics", "Stationery", "Accessories"
        ]

        occupied_padded = set()
        
        for shelf_id, category in enumerate(categories):
            while True:
                # Randomize orientation
                is_horizontal = random.choice([True, False])
                if is_horizontal:
                    w, h = 2, 1
                    x = random.randint(1, self.grid_size - 3)
                    y = random.randint(1, self.grid_size - 2)
                else:
                    w, h = 1, 2
                    x = random.randint(1, self.grid_size - 2)
                    y = random.randint(1, self.grid_size - 3)
                    
                # To prevent blocking paths entirely, check a padded footprint
                # so shelves don't touch each other
                padded_footprint = {(x + dx, y + dy) for dx in range(-1, w+1) for dy in range(-1, h+1)}
                
                # If these cells are free, place it!
                if not occupied_padded.intersection(padded_footprint):
                    occupied_padded.update(padded_footprint)
                    self.obstacles.append(StaticObstacle(f"s_{shelf_id}", x, y, w=w, h=h, category=category))
                    break
=======
        self.obstacles = []

        if self.curriculum.current_stage == 1:
            return

        if self.curriculum.current_stage >= 2:
            occupied = {(self.agent.x, self.agent.y), (self.goal.x, self.goal.y)}

            for i in range(self.STAGE2_STATIC):
                pos = self._sample_free_position(occupied)
                self.obstacles.append(StaticObstacle(f"s_{i}", pos[0], pos[1]))
                occupied.add(pos)

            for i in range(self.STAGE2_PATROL):
                start = self._sample_free_position(occupied)
                occupied.add(start)
                waypoints = self._generate_patrol_path(start, occupied)
                self.obstacles.append(PatrolObstacle(f"p_{i}", waypoints, speed=2))

            
            for i in range(self.STAGE2_RANDOM):
                pos = self._sample_free_position(occupied)
                self.obstacles.append(RandomWalkObstacle(f"r_{i}", pos[0], pos[1]))
                occupied.add(pos)

        if self.curriculum.current_stage >= 3:
            
            for i in range(self.STAGE3_COMPETITORS):
                pos = self._sample_free_position(occupied)
                self.obstacles.append(
                    CompetingRobot(
                        f"c_{i}", pos[0], pos[1],
                        self.goal.x, self.goal.y,
                        speed=3  
                    )
                )
                occupied.add(pos)
>>>>>>> e89b63fe399fc0a90331a416aa573fdecf7f63b7

    def _update_obstacles(self):
        
        for obstacle in self.obstacles:
            occupied = set()
            occupied.add((self.agent.x, self.agent.y))
            occupied.add((self.goal.x, self.goal.y))
            for other in self.obstacles:
                if other.id != obstacle.id:
                    occupied.update(other.occupied_cells)
            obstacle.update(self.current_step, self.grid_size, occupied)

    def _generate_patrol_path(
        self, start: Tuple[int, int], occupied: set
    ) -> List[Tuple[int, int]]:
        
        path = [start]
        current = start
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        for _ in range(random.randint(1, 3)):  
            random.shuffle(directions)
            moved = False
            for dx, dy in directions:
                nx, ny = current[0] + dx, current[1] + dy
                if (
                    0 <= nx < self.grid_size
                    and 0 <= ny < self.grid_size
                    and (nx, ny) not in occupied
                    and (nx, ny) not in path
                ):
                    path.append((nx, ny))
                    occupied.add((nx, ny))
                    current = (nx, ny)
                    moved = True
                    break
            if not moved:
                break

        
        if len(path) < 2:
            
            nx, ny = start[0], start[1]
            for dx, dy in directions:
                nx2, ny2 = start[0] + dx, start[1] + dy
                if (
                    0 <= nx2 < self.grid_size
                    and 0 <= ny2 < self.grid_size
                    and (nx2, ny2) not in occupied
                ):
                    path.append((nx2, ny2))
                    break
            if len(path) < 2:
                path.append(start)  # Fallback: just stay

        return path

    

    def _sample_unique_positions(self, n: int) -> List[Tuple[int, int]]:
        
        all_positions = [
            (x, y) for x in range(self.grid_size) for y in range(self.grid_size)
        ]
        return random.sample(all_positions, n)

    def _sample_free_position(self, occupied: set) -> Tuple[int, int]:
        
        while True:
            x = random.randint(0, self.grid_size - 1)
            y = random.randint(0, self.grid_size - 1)
            if (x, y) not in occupied:
                return (x, y)

    

    def get_state(self) -> Dict[str, Any]:
        
        return {
            "episode": self.curriculum.total_episodes,
            "step": self.current_step,
            "agent": self.agent.to_dict(),
            "goal": self.goal.to_dict(),
            "obstacles": [obs.to_dict() for obs in self.obstacles],
            "metrics": {
                "reward_this_step": round(self.episode_reward, 4),
                "total_reward": round(self.episode_reward, 4),
                "distance_to_goal": self._manhattan_distance(),
            },
            "stage": self.curriculum.current_stage,
            "done": self.agent.status in ("collided", "reached_goal", "goal_stolen"),
            "route_stage": getattr(self, "route_stage", "to_shelf"),
            "target_category": getattr(self, "target_category", ""),
            "delivery_pos": {"x": self.delivery_pos[0], "y": self.delivery_pos[1]} if hasattr(self, "delivery_pos") else {"x": 14, "y": 14},
        }

    

    def render(self):
        symbols = {
            "empty": "· ",
            "agent": "A ",
            "goal": "G ",
            "static": "# ",
            "patrol": "P ",
            "random_walk": "R ",
            "competing_robot": "C ",
        }

        grid = [["· "] * self.grid_size for _ in range(self.grid_size)]

        
        for obs in self.obstacles:
            for cell in obs.occupied_cells:
                if 0 <= cell[0] < self.grid_size and 0 <= cell[1] < self.grid_size:
                    grid[cell[1]][cell[0]] = symbols.get(obs.type, "? ")

        grid[self.goal.y][self.goal.x] = symbols["goal"]

        
        grid[self.agent.y][self.agent.x] = symbols["agent"]

        
        header = f"Stage {self.curriculum.current_stage} | Step {self.current_step} | Reward {self.episode_reward:.2f} | Dist {self._manhattan_distance()}"
        print(f"\n{'─' * (self.grid_size * 2 + 2)}")
        print(f" {header}")
        print(f"{'─' * (self.grid_size * 2 + 2)}")
        for row in grid:
            print("|" + "".join(row) + "|")
        print(f"{'─' * (self.grid_size * 2 + 2)}")

    

    def __repr__(self):
        return (
            f"WarehouseEnv(grid={self.grid_size}x{self.grid_size}, "
            f"stage={self.curriculum.current_stage}, "
            f"obstacles={len(self.obstacles)})"
        )
