from manim import *

class SoundMystery(Scene):
    def construct(self):
        # --- 設定 ---
        # フォント設定（子供向けの丸ゴシック）
        JAPANESE_FONT = "Hiragino Maru Gothic ProN"

        # 色の設定（グラデーション風）
        WAVE_COLORS = [BLUE_C, TEAL_C, GREEN_C, YELLOW_C, RED_C]
        COLOR_COMPLEX = PURPLE_B

        # 基本周波数とパラメータ
        f0 = 0.5  # 基本周波数
        num_waves = 5  # 波の数（5本に増量）

        # 振幅（1/n減衰でリアルな構成）
        amps = [1.0 / (n + 1) for n in range(num_waves)]  # [1.0, 0.5, 0.33, 0.25, 0.2]

        # 波形の関数を動的に生成
        wave_funcs = []
        for n in range(num_waves):
            wave_funcs.append(lambda t, n=n: amps[n] * np.sin(2 * PI * (n + 1) * f0 * t))

        # 合成波（全部の波を足し合わせたもの）
        def func_complex(t):
            return sum(f(t) for f in wave_funcs)

        # =========================================================
        # シーン1: 導入 - 「声のかたち」を見てみよう
        # =========================================================
        title = MarkupText("声のかたちを見てみよう！", font_size=48, font=JAPANESE_FONT).to_edge(UP)
        self.play(Write(title))

        # 複雑な波を表示
        complex_wave = FunctionGraph(func_complex, x_range=[-4, 4], color=COLOR_COMPLEX).scale(0.8)
        wave_label = MarkupText("あなたの声（ギザギザの波）", font_size=24, color=COLOR_COMPLEX, font=JAPANESE_FONT).next_to(complex_wave, UP)

        self.play(Create(complex_wave), Write(wave_label))
        self.wait(1.5)

        question_text = MarkupText("なんでこんなにギザギザなの？", font_size=28, font=JAPANESE_FONT).to_edge(DOWN)
        self.play(Write(question_text))
        self.wait(1.5)
        self.play(FadeOut(question_text))

        # =========================================================
        # シーン2: 分解 - 波が「ほどける」（5本に！）
        # =========================================================
        new_title = MarkupText("実は...波がたくさん重なっているんだ！", font_size=42, font=JAPANESE_FONT).to_edge(UP)
        self.play(
            Transform(title, new_title),
            FadeOut(wave_label)
        )
        self.wait(0.5)

        # 5つの単純な波を作成
        waves = VGroup()
        for n in range(num_waves):
            wave = FunctionGraph(wave_funcs[n], x_range=[-4, 4], color=WAVE_COLORS[n]).scale(0.6)
            waves.add(wave)

        # 波を縦に綺麗に配置（上から下へ）
        waves.arrange(DOWN, buff=0.5)

        # 複雑な波が5つにほどける
        wave_copies = VGroup(*[complex_wave.copy() for _ in range(num_waves)])

        self.play(
            FadeOut(complex_wave),
            FadeIn(wave_copies)
        )

        # それぞれが異なる波形に変化しながら、整列
        transforms = []
        for i, (copy, target) in enumerate(zip(wave_copies, waves)):
            transforms.append(Transform(copy, target))

        self.play(*transforms, run_time=2.5)
        self.wait(0.5)

        # ラベルを追加（左側に配置して重ならないように）
        labels = VGroup()
        label_texts = [
            "「ドレミの波」",
            "「声質の波①」",
            "「声質の波②」",
            "「声質の波③」",
            "「声質の波④」"
        ]

        for i, (wave, text) in enumerate(zip(wave_copies, label_texts)):
            label = MarkupText(text, font_size=18, color=WAVE_COLORS[i], font=JAPANESE_FONT).next_to(wave, LEFT, buff=0.3)
            labels.add(label)

        self.play(Write(labels))
        self.wait(1.5)

        explain_text = MarkupText("5つのシンプルな波に分かれた！", font_size=32, color=YELLOW, font=JAPANESE_FONT).to_edge(DOWN)
        self.play(Write(explain_text))
        self.wait(1.5)
        self.play(FadeOut(explain_text))

        # =========================================================
        # シーン2.5: 足し算の可視化 - 「重ね合わせ」を示す
        # =========================================================
        addition_title = MarkupText("この5つを<b>足し算</b>すると？", font_size=48, font=JAPANESE_FONT).to_edge(UP)
        self.play(Transform(title, addition_title))

        # ラベルを一時的に消す
        self.play(FadeOut(labels))

        # 5つの波を中央に集める
        center_anims = [wave.animate.move_to(ORIGIN) for wave in wave_copies]
        self.play(*center_anims, run_time=1.5)
        self.wait(0.5)

        # 足し算の数式を表示
        equation = MarkupText(
            "5つの波を全部足すと = ?",
            font_size=28,
            font=JAPANESE_FONT
        ).to_edge(DOWN)
        self.play(Write(equation))
        self.wait(1)

        # 合成波を作成（5つの波が重なった結果）
        combined_wave = FunctionGraph(func_complex, x_range=[-4, 4], color=COLOR_COMPLEX).scale(0.8)

        # 5つの波を消して、合成波を表示
        self.play(
            *[FadeOut(wave) for wave in wave_copies],
            Create(combined_wave),
            run_time=1.5
        )

        # 答えを表示
        answer = MarkupText("= 元のギザギザの波に戻った！", font_size=32, color=YELLOW, font=JAPANESE_FONT).next_to(combined_wave, UP)
        self.play(
            FadeOut(equation),
            Write(answer)
        )
        self.wait(1.5)

        重ね合わせ_text = MarkupText("これが「<b>重ね合わせ</b>」だよ！", font_size=36, color=GREEN, font=JAPANESE_FONT).to_edge(DOWN)
        self.play(Write(重ね合わせ_text))
        self.wait(2)
        self.play(FadeOut(answer), FadeOut(重ね合わせ_text))

        # =========================================================
        # シーン3: 引き算（ハイカット） - 高い波を消す
        # =========================================================
        highcut_title = MarkupText("高い波を<b>引き算</b>してみよう！", font_size=48, font=JAPANESE_FONT).to_edge(UP)
        self.play(Transform(title, highcut_title))

        # 合成波を消して、再び5つの波を表示
        self.play(FadeOut(combined_wave))

        # 5つの波を再作成
        waves_new = VGroup()
        for n in range(num_waves):
            wave = FunctionGraph(wave_funcs[n], x_range=[-4, 4], color=WAVE_COLORS[n]).scale(0.6)
            waves_new.add(wave)
        waves_new.arrange(DOWN, buff=0.5)

        labels_new = VGroup()
        for i, text in enumerate(label_texts):
            label = MarkupText(text, font_size=18, color=WAVE_COLORS[i], font=JAPANESE_FONT).next_to(waves_new[i], LEFT, buff=0.3)
            labels_new.add(label)

        self.play(
            Create(waves_new),
            Write(labels_new)
        )
        self.wait(1)

        # 高い波（wave 2, 3, 4）を消す
        minus_text = MarkupText("高い波（②③④）を消すよ！", font_size=28, color=RED, font=JAPANESE_FONT).to_edge(DOWN)
        self.play(Write(minus_text))
        self.wait(0.5)

        # 高い3つの波を消す
        self.play(
            *[FadeOut(waves_new[i]) for i in [2, 3, 4]],
            *[FadeOut(labels_new[i]) for i in [2, 3, 4]],
            run_time=1.5
        )
        self.play(FadeOut(minus_text))
        self.wait(0.5)

        # 残った2つの波を中央に移動
        remaining_waves = VGroup(waves_new[0], waves_new[1])
        remaining_labels = VGroup(labels_new[0], labels_new[1])

        self.play(
            remaining_waves.animate.arrange(DOWN, buff=0.8).move_to(ORIGIN),
            FadeOut(remaining_labels),
            run_time=1
        )

        # 低い波だけの合成波を作成
        def func_low_only(t):
            return wave_funcs[0](t) + wave_funcs[1](t)

        low_only_wave = FunctionGraph(func_low_only, x_range=[-4, 4], color=BLUE).scale(0.8)

        self.play(
            *[FadeOut(w) for w in remaining_waves],
            Create(low_only_wave)
        )

        # 元の複雑な波と比較（薄く表示）
        original_ghost = FunctionGraph(func_complex, x_range=[-4, 4], color=COLOR_COMPLEX, stroke_opacity=0.3).scale(0.8)
        self.play(Create(original_ghost))

        # 結果を表示
        result_highcut = MarkupText(
            "モゴモゴした音になった！\nまるで水の中でしゃべってるみたい",
            font_size=28,
            color=BLUE,
            font=JAPANESE_FONT
        ).to_edge(DOWN)
        self.play(Write(result_highcut))
        self.wait(2.5)

        # クリーンアップ
        self.play(
            FadeOut(low_only_wave),
            FadeOut(original_ghost),
            FadeOut(result_highcut)
        )

        # =========================================================
        # シーン4: 引き算（ローカット） - 低い波を消す
        # =========================================================
        lowcut_title = MarkupText("今度は<b>低い波（ドレミの波）</b>を引き算！", font_size=44, font=JAPANESE_FONT).to_edge(UP)
        self.play(Transform(title, lowcut_title))
        self.wait(0.5)

        # 再び5つの波を表示
        waves_low = VGroup()
        for n in range(num_waves):
            wave = FunctionGraph(wave_funcs[n], x_range=[-4, 4], color=WAVE_COLORS[n]).scale(0.6)
            waves_low.add(wave)
        waves_low.arrange(DOWN, buff=0.5)

        labels_low = VGroup()
        for i, text in enumerate(label_texts):
            label = MarkupText(text, font_size=18, color=WAVE_COLORS[i], font=JAPANESE_FONT).next_to(waves_low[i], LEFT, buff=0.3)
            labels_low.add(label)

        self.play(
            Create(waves_low),
            Write(labels_low)
        )
        self.wait(1)

        # 低い波（wave 0, 1）を消す
        minus_text2 = MarkupText("低い波（ドレミと①）を消すよ！", font_size=28, color=RED, font=JAPANESE_FONT).to_edge(DOWN)
        self.play(Write(minus_text2))
        self.wait(0.5)

        self.play(
            *[FadeOut(waves_low[i]) for i in [0, 1]],
            *[FadeOut(labels_low[i]) for i in [0, 1]],
            run_time=1.5
        )
        self.play(FadeOut(minus_text2))
        self.wait(0.5)

        # 残った3つの波を中央に集める
        high_waves = VGroup(waves_low[2], waves_low[3], waves_low[4])

        self.play(
            high_waves.animate.arrange(DOWN, buff=0.8).move_to(ORIGIN),
            *[FadeOut(labels_low[i]) for i in [2, 3, 4]],
            run_time=1
        )

        # 高い波だけの合成波を作成
        def func_high_only(t):
            return wave_funcs[2](t) + wave_funcs[3](t) + wave_funcs[4](t)

        high_only_wave = FunctionGraph(func_high_only, x_range=[-4, 4], color=YELLOW).scale(0.8)

        self.play(
            *[FadeOut(w) for w in high_waves],
            Create(high_only_wave)
        )

        # 元の波と比較
        original_ghost2 = FunctionGraph(func_complex, x_range=[-4, 4], color=COLOR_COMPLEX, stroke_opacity=0.3).scale(0.8)
        self.play(Create(original_ghost2))

        # 結果を表示
        result_lowcut = MarkupText(
            "カリカリした音になった！\nラジオから聞こえる音みたい",
            font_size=28,
            color=YELLOW,
            font=JAPANESE_FONT
        ).to_edge(DOWN)
        self.play(Write(result_lowcut))
        self.wait(2.5)

        # クリーンアップ
        self.play(
            FadeOut(high_only_wave),
            FadeOut(original_ghost2),
            FadeOut(result_lowcut)
        )

        # =========================================================
        # シーン5: まとめ - 音のヒミツ
        # =========================================================
        summary_title = MarkupText("音のヒミツ、わかったかな？", font_size=48, font=JAPANESE_FONT).to_edge(UP)
        self.play(Transform(title, summary_title))
        self.wait(1)

        # 3つの要点をリスト表示
        point1 = MarkupText("✓ 声は「単純な波の<b>足し算</b>」でできている", font_size=28, font=JAPANESE_FONT)
        point2 = MarkupText("✓ 波を<b>引き算</b>すると、声の聞こえ方が変わる", font_size=28, font=JAPANESE_FONT)
        point3 = MarkupText("✓ 波の組み合わせで、声の個性が生まれる", font_size=28, font=JAPANESE_FONT)

        points = VGroup(point1, point2, point3).arrange(DOWN, aligned_edge=LEFT, buff=0.5).move_to(ORIGIN)

        self.play(Write(point1))
        self.wait(1)
        self.play(Write(point2))
        self.wait(1)
        self.play(Write(point3))
        self.wait(2)

        # エンディング
        self.play(FadeOut(points))

        ending_text = MarkupText(
            "さあ、自分の声で\n実験してみよう！",
            font_size=48,
            color=YELLOW,
            font=JAPANESE_FONT
        ).move_to(ORIGIN)

        self.play(
            FadeOut(title),
            Write(ending_text)
        )
        self.wait(3)
