<?php
// 投诉前台入口
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// 解析路径：/app/企业ID/通道SN 或 /app/企业ID/通道SN/notice
if (preg_match('/^\/app\/([^\/]+)\/([^\/]+)\/notice$/', $path, $matches)) {
    // 投诉须知页面
    $enterpriseId = $matches[1];
    $channelSn = $matches[2];
    include __DIR__ . '/complaint_notice.php';
} elseif (preg_match('/^\/app\/([^\/]+)\/([^\/]+)$/', $path, $matches)) {
    // 投诉页面
    $enterpriseId = $matches[1];
    $channelSn = $matches[2];
    
    // 包含实际的投诉页面
    include __DIR__ . '/complaint.php';
} else {
    http_response_code(404);
    echo '页面不存在';
}
?>
