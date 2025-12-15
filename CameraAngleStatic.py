from manim import *
import numpy as np

class CameraAngleStatic(Scene):
    def construct(self):
        # --- 設定値 ---
        # 画面上のスケーリング (1m = 1.5単位 に縮小して余裕を持たせる)
        scale_factor = 1.5

        # 実際の値 (単位: m)
        room_height = 2.7
        cam_height = 2.5
        person_height = 1.75 # 計算上の175cmを採用

        # 計算上のターゲット距離 (2.06m)
        target_distance = 2.06

        # 座標の定義
        # 地面を y = -2.5 に下げて余裕を持たせる
        ground_y = -2.5

        # カメラの位置 (x=-4, yは高さ分加算)
        cam_x = -4.0
        cam_point = np.array([cam_x, ground_y + cam_height * scale_factor, 0])

        # 人の頭の位置
        person_x = cam_x + target_distance * scale_factor
        head_point = np.array([person_x, ground_y + person_height * scale_factor, 0])

        # 水平線の参照点 (カメラの高さで人の真上)
        horizontal_ref_point = np.array([person_x, cam_point[1], 0])

        # --- 描画オブジェクトの作成 ---

        # 1. 地面と壁
        floor = Line(start=np.array([-6, ground_y, 0]), end=np.array([6, ground_y, 0]), color=GREY)
        wall = Line(start=np.array([cam_x, ground_y, 0]), end=np.array([cam_x, ground_y + room_height * scale_factor, 0]), color=GREY)

        # 2. 人（簡易的な棒人間）
        person_body = Line(
            start=np.array([person_x, ground_y, 0]),
            end=head_point,
            color=BLUE
        )
        person_head = Circle(radius=0.15, color=BLUE, fill_opacity=1).move_to(head_point)
        person_label = Text("Person (175cm)", font_size=20).next_to(person_head, RIGHT, buff=0.3)

        # 3. カメラ（簡易的な点）
        camera_dot = Dot(cam_point, color=RED, radius=0.1)
        camera_label = Text("Camera (250cm)", font_size=20).next_to(camera_dot, LEFT, buff=0.3)

        # 4. 補助線（三角形）
        # 視線
        line_of_sight = Line(cam_point, head_point, color=YELLOW)
        # 水平線
        horizontal_line = DashedLine(cam_point, horizontal_ref_point, color=WHITE)
        # 高低差の線
        vertical_diff_line = DashedLine(horizontal_ref_point, head_point, color=WHITE)

        # 5. 角度の表示
        # 角度の計算 (arctan(高低差/距離))
        diff_h = cam_height - person_height
        angle_val = np.degrees(np.arctan(diff_h / target_distance))

        angle_arc = Angle(horizontal_line, line_of_sight, radius=1, other_angle=True, color=YELLOW)
        angle_tex = Text("θ ≈ 20°", font_size=24).next_to(angle_arc, RIGHT)

        # 6. 寸法の表示
        brace_dist = Brace(Line(np.array([cam_x, ground_y, 0]), np.array([person_x, ground_y, 0])), DOWN)
        text_dist = Text("Distance: 206cm", font_size=18)
        brace_dist.put_at_tip(text_dist)

        brace_height = Brace(vertical_diff_line, RIGHT)
        text_height = Text("Diff: 75cm", font_size=18)
        brace_height.put_at_tip(text_height)

        # --- アニメーション実行 ---
        self.play(Create(floor), Create(wall))
        self.play(GrowFromCenter(person_body), FadeIn(person_head), FadeIn(person_label))
        self.play(FadeIn(camera_dot), Write(camera_label))
        self.wait(1)

        # 視線と三角形の描画
        self.play(Create(horizontal_line), Create(vertical_diff_line))
        self.play(Create(line_of_sight))
        self.play(Create(angle_arc), Write(angle_tex))
        self.play(FadeIn(brace_dist), FadeIn(text_dist), FadeIn(brace_height), FadeIn(text_height))

        self.wait(2)
