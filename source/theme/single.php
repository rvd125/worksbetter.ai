<?php defined('ABSPATH') || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class('guide-page'); ?>><?php wp_body_open(); ?>
<header class="guide-header wrap"><div class="navbar"><a class="brand" href="<?php echo esc_url(home_url('/')); ?>">worksbetter.<b>·</b></a><nav aria-label="Main navigation"><a href="<?php echo esc_url(home_url('/#playground')); ?>">Examples</a><a href="<?php echo esc_url(home_url('/guides/')); ?>">Guides</a><a class="button primary" href="<?php echo esc_url(home_url('/#contact')); ?>">Talk to Renzo ↗</a></nav></div></header>
<main class="guide-shell"><article class="guide-article"><?php if(have_posts()):while(have_posts()):the_post(); ?><p class="guide-article__meta">Works Better guide</p><h1><?php the_title(); ?></h1><?php if(has_excerpt()): ?><p class="guide-article__excerpt"><?php echo esc_html(get_the_excerpt()); ?></p><?php endif; ?><div class="guide-article__body"><?php the_content(); ?></div><?php endwhile;endif; ?></article></main>
<footer class="guide-footer"><div class="wrap guide-footer__inner"><span>Works Better by Renzo Demartini</span><a href="<?php echo esc_url(home_url('/#contact')); ?>">Talk to Renzo ↗</a><a href="<?php echo esc_url(home_url('/enquiry-privacy/')); ?>">Enquiry privacy</a></div></footer>
<?php wp_footer(); ?></body></html>

