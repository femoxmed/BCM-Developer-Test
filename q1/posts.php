<?php
/** Include inside a WordPress theme template running PHP 8. See ../ANSWERS.md. */
$page_input = $_GET['page'] ?? '1';
$page = is_string($page_input)
    ? filter_var($page_input, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])
    : false;
$page = $page === false ? 1 : $page;
$search_input = $_GET['s'] ?? '';
$search = is_string($search_input) ? sanitize_text_field(wp_unslash($search_input)) : '';

$q = new WP_Query([
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => 10,
    'paged' => $page,
    's' => $search,
    'ignore_sticky_posts' => true,
]);
$pages = (int) $q->max_num_pages;
?>
<h1>Page <?= esc_html((string) $page) ?> of <?= esc_html((string) $pages) ?><?php if ($search !== ''): ?>: Search for <?= esc_html($search) ?><?php endif; ?></h1>
<?php if (!$q->have_posts()): ?>
    <p>No posts found for this page.</p>
<?php endif; ?>
<?php while ($q->have_posts()):
    $q->the_post();
    $ad_number = 0;
    // Assumption: standalone [ad] blocks, not markers inside tags/attributes/code.
    // Replace before WordPress formatting so it recognises the block-level divs.
    $content = str_replace('<p>[ad]</p>', '[ad]', get_the_content());
    $content = preg_replace_callback('/\[ad\]/', function () use (&$ad_number) {
        $ad_number++;
        $id = 'ad-' . get_the_ID() . '-' . $ad_number;
        return '<div class="ad ad-' . $ad_number . '" id="' . esc_attr($id) . '"></div>';
    }, $content);
    $content = apply_filters('the_content', $content);
?>
    <article>
        <h2><?= esc_html(get_the_title()) ?></h2>
        <div class="entry-content"><?= $content /* Trusted WordPress content pipeline; preserve rich HTML. */ ?></div>
    </article>
<?php endwhile;
wp_reset_postdata();
