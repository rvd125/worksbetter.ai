<?php defined('ABSPATH') || exit;
if (get_post_meta(get_queried_object_id(), '_wb_imported', true)) { require get_template_directory() . '/index.php'; return; }
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class('guide-page'); ?>><?php wp_body_open(); ?>
<header class="guide-header wrap"><div class="navbar"><a class="brand" href="<?php echo esc_url(home_url('/')); ?>">worksbetter.<b>·</b></a><nav aria-label="Main navigation"><a href="<?php echo esc_url(home_url('/#playground')); ?>">Examples</a><a href="<?php echo esc_url(home_url('/guides/')); ?>">Guides</a><a class="button primary" href="<?php echo esc_url(home_url('/#contact')); ?>">Talk to Renzo ↗</a></nav></div></header>
<main class="guide-shell"><?php if(have_posts()):while(have_posts()):the_post(); ?><p class="guide-eyebrow">Practical guides</p><h1><?php the_title(); ?></h1><div class="guide-intro"><?php the_content(); ?></div><?php endwhile;endif; ?>
<section class="guide-library" aria-labelledby="guide-library-title"><h2 id="guide-library-title">Latest guides</h2><div class="guide-grid"><?php $wb_guides=new WP_Query(array('post_type'=>'post','post_status'=>'publish','posts_per_page'=>24,'orderby'=>'date','order'=>'DESC'));if($wb_guides->have_posts()):while($wb_guides->have_posts()):$wb_guides->the_post(); ?><a class="guide-card" href="<?php the_permalink(); ?>"><span class="guide-card__label">Workflow guide</span><h2><?php the_title(); ?></h2><p><?php echo esc_html(get_the_excerpt()); ?></p><span class="guide-card__link">Read the guide ↗</span></a><?php endwhile;wp_reset_postdata();else: ?><p class="guide-empty">The first practical guide is on its way. Start with an <a href="<?php echo esc_url(home_url('/#playground')); ?>">interactive workflow example</a> instead.</p><?php endif; ?></div></section></main>
<footer class="guide-footer"><div class="wrap guide-footer__inner"><span>Works Better by Renzo Demartini</span><a href="<?php echo esc_url(home_url('/enquiry-privacy/')); ?>">Enquiry privacy</a><a href="<?php echo esc_url(home_url('/#contact')); ?>">Talk to Renzo ↗</a></div></footer>
<?php wp_footer(); ?></body></html>

