from manim import *
import numpy as np

class CameraAngleDynamic(Scene):
    def construct(self):
        # --- 設定値 ---
        scale_factor = 1.5  # 画面に余裕を持たせる
        room_height = 2.7
        person_height = 1.75

        ground_y = -2.5
        cam_x = -4.0

        # --- 動的な変数 (ValueTracker) ---
        # 距離: 5m → 2.06m → 0.8m → 4m
        dist_tracker = ValueTracker(5.0)
        # カメラ高さ: 2.7m → 2.5m (270cm → 250cm)
        height_tracker = ValueTracker(2.7)

        # --- 静的オブジェクト ---
        floor = Line(start=np.array([-6, ground_y, 0]), end=np.array([6, ground_y, 0]), color=GREY)
        wall = Line(start=np.array([cam_x, ground_y, 0]), end=np.array([cam_x, ground_y + room_height * scale_factor, 0]), color=GREY)

        self.add(floor, wall)

        # --- 動的オブジェクト (always_redraw) ---

        # カメラドット（高さが変わる）
        def get_camera_dot():
            h = height_tracker.get_value()
            cam_point = np.array([cam_x, ground_y + h * scale_factor, 0])
            return Dot(cam_point, color=RED, radius=0.1)

        camera_dot = always_redraw(get_camera_dot)

        # カメララベル
        def get_camera_label():
            h = height_tracker.get_value()
            cam_point = np.array([cam_x, ground_y + h * scale_factor, 0])
            label = Text(f"Camera ({h*100:.0f}cm)", font_size=18).next_to(cam_point, LEFT, buff=0.3)
            return label

        camera_label = always_redraw(get_camera_label)

        # 人（全体をグループ化）
        def get_person_group():
            d = dist_tracker.get_value()
            p_x = cam_x + d * scale_factor
            head_p = np.array([p_x, ground_y + person_height * scale_factor, 0])
            foot_p = np.array([p_x, ground_y, 0])

            body = Line(foot_p, head_p, color=BLUE, stroke_width=3)
            head = Circle(radius=0.15, color=BLUE, fill_opacity=1).move_to(head_p)
            return VGroup(body, head)

        person = always_redraw(get_person_group)

        # 視線
        def get_sight_line():
            h = height_tracker.get_value()
            d = dist_tracker.get_value()
            cam_point = np.array([cam_x, ground_y + h * scale_factor, 0])
            p_x = cam_x + d * scale_factor
            head_p = np.array([p_x, ground_y + person_height * scale_factor, 0])
            return Line(cam_point, head_p, color=YELLOW, stroke_width=2)

        sight_line = always_redraw(get_sight_line)

        # 水平線（基準）
        def get_horiz_line():
            h = height_tracker.get_value()
            d = dist_tracker.get_value()
            cam_point = np.array([cam_x, ground_y + h * scale_factor, 0])
            p_x = cam_x + d * scale_factor
            end_p = np.array([p_x, cam_point[1], 0])
            return DashedLine(cam_point, end_p, color=WHITE, stroke_opacity=0.5)

        horiz_line = always_redraw(get_horiz_line)

        # 角度表示（最も重要な部分）
        def get_angle_indicator():
            h = height_tracker.get_value()
            d = dist_tracker.get_value()
            diff_h = h - person_height
            # 角度計算
            theta_rad = np.arctan(diff_h / d)
            theta_deg = np.degrees(theta_rad)

            cam_point = np.array([cam_x, ground_y + h * scale_factor, 0])
            p_x = cam_x + d * scale_factor
            head_p = np.array([p_x, ground_y + person_height * scale_factor, 0])
            end_p_horiz = np.array([p_x, cam_point[1], 0])

            l1 = Line(cam_point, end_p_horiz)
            l2 = Line(cam_point, head_p)

            # 角度が小さい場合はradiusを調整
            radius = min(0.8, d * scale_factor * 0.2)

            # other_angle=True で内角（下向き）をとる
            ang = Angle(l1, l2, radius=radius, other_angle=True, color=YELLOW)

            label = Text(f"{theta_deg:.1f}°", font_size=22).next_to(ang, RIGHT, buff=0.2)

            return VGroup(ang, label)

        angle_indicator = always_redraw(get_angle_indicator)

        # 情報パネル（左上）
        def get_info_panel():
            d = dist_tracker.get_value()
            h = height_tracker.get_value()
            diff_h = h - person_height
            theta_deg = np.degrees(np.arctan(diff_h / d))

            info = VGroup(
                Text(f"Distance: {d:.2f}m ({d*100:.0f}cm)", font_size=20),
                Text(f"Camera Height: {h:.2f}m ({h*100:.0f}cm)", font_size=20),
                Text(f"Person Height: {person_height:.2f}m ({person_height*100:.0f}cm)", font_size=20),
                Text(f"Angle: {theta_deg:.1f}°", font_size=20, color=YELLOW)
            ).arrange(DOWN, aligned_edge=LEFT, buff=0.2).to_corner(UL, buff=0.5)

            return info

        info_panel = always_redraw(get_info_panel)

        # --- シーン実行 ---
        self.add(camera_dot, camera_label, person, sight_line, horiz_line, angle_indicator, info_panel)

        # スムーズな連続アニメーション（waitを最小化）
        # 1. 遠く(5m)から計算値(2.06m)へ近づく（高さ270cmのまま）
        self.play(dist_tracker.animate.set_value(2.06), run_time=3, rate_func=smooth)

        # 2. カメラ高さを270cmから250cmに下げる（距離2.06mのまま）- 角度変化を見せる
        self.play(height_tracker.animate.set_value(2.5), run_time=2, rate_func=smooth)

        # 3. さらに近づく(0.8m)（角度が急変するのを見せる）
        self.play(dist_tracker.animate.set_value(0.8), run_time=3, rate_func=smooth)

        # 4. 離れる(4m)
        self.play(dist_tracker.animate.set_value(4.0), run_time=3, rate_func=smooth)

        # 最後に少しだけwait
        self.wait(1)
