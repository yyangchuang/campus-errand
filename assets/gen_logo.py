from PIL import Image, ImageDraw
import math, shutil

def make_logo(size):
    s = size
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(s * 0.21)

    # 圆角矩形背景 橙色斜向渐变
    for y in range(s):
        for x in range(s):
            # 圆角遮罩
            inside = True
            if x < r and y < r:
                if math.sqrt((r - x) ** 2 + (r - y) ** 2) > r:
                    inside = False
            elif x >= s - r and y < r:
                if math.sqrt((x - (s - r - 1)) ** 2 + (r - y) ** 2) > r:
                    inside = False
            elif x < r and y >= s - r:
                if math.sqrt((r - x) ** 2 + (y - (s - r - 1)) ** 2) > r:
                    inside = False
            elif x >= s - r and y >= s - r:
                if math.sqrt((x - (s - r - 1)) ** 2 + (y - (s - r - 1)) ** 2) > r:
                    inside = False
            if not inside:
                continue
            # 斜向渐变
            t = x / s * 0.4 + y / s * 0.6
            gr = int(255 - (255 - 229) * t)
            gg = int(122 - (122 - 90) * t)
            gb = int(69 - (69 - 43) * t)
            d.point((x, y), (gr, gg, gb, 255))

    # 装饰点
    def dot(cx, cy, rad, alpha=50):
        for dy in range(-rad, rad + 1):
            for dx in range(-rad, rad + 1):
                if dx * dx + dy * dy <= rad * rad:
                    px, py = cx + dx, cy + dy
                    if 0 <= px < s and 0 <= py < s:
                        d.point((px, py), (255, 255, 255, alpha))

    dot(int(s * 0.18), int(s * 0.18), max(2, int(s * 0.08)), 50)
    dot(int(s * 0.85), int(s * 0.82), max(2, int(s * 0.06)), 40)
    dot(int(s * 0.82), int(s * 0.14), max(1, int(s * 0.03)), 40)

    white = (255, 255, 255, 255)
    accent = (229, 90, 43, 255)
    sw = max(3, int(s * 0.055))

    # 头
    head_cx = int(s * 0.52)
    head_cy = int(s * 0.30)
    head_r = int(s * 0.085)
    d.ellipse([head_cx - head_r, head_cy - head_r, head_cx + head_r, head_cy + head_r], fill=white)

    # 身体
    body_top = (head_cx, head_cy + head_r)
    body_bot = (int(s * 0.48), int(s * 0.62))
    d.line([body_top, body_bot], fill=white, width=sw)

    # 手臂
    arm_s = (head_cx, int(s * 0.40))
    d.line([arm_s, (int(s * 0.70), int(s * 0.46))], fill=white, width=sw)
    d.line([arm_s, (int(s * 0.30), int(s * 0.46))], fill=white, width=sw)

    # 腿
    hip = body_bot
    d.line([hip, (int(s * 0.58), int(s * 0.72)), (int(s * 0.68), int(s * 0.84))], fill=white, width=sw)
    d.line([hip, (int(s * 0.38), int(s * 0.72)), (int(s * 0.28), int(s * 0.84))], fill=white, width=sw)

    # 包裹 (小方块)
    pkg_x = int(s * 0.72)
    pkg_y = int(s * 0.42)
    pkg_s = int(s * 0.095)
    d.rectangle([pkg_x - pkg_s, pkg_y - pkg_s, pkg_x + pkg_s, pkg_y + pkg_s], fill=white)
    cross = max(1, int(s * 0.028))
    d.rectangle([pkg_x - cross, pkg_y - pkg_s, pkg_x + cross, pkg_y + pkg_s], fill=accent)
    d.rectangle([pkg_x - pkg_s, pkg_y - cross, pkg_x + pkg_s, pkg_y + cross], fill=accent)

    return img


for size in [144, 96, 72, 48]:
    img = make_logo(size)
    path = f'assets/logo-{size}x{size}.png'
    img.save(path)
    print(f'✅ {path}')

shutil.copy('assets/logo-144x144.png', 'assets/logo.png')
print('✅ assets/logo.png')
