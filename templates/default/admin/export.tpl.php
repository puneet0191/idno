<div class="row">
    <div class="col-md-10 col-md-offset-1">
        <?php

            echo $this->draw('admin/menu');

        ?>
        <h1>
            Export content
        </h1>

    </div>
</div>
<div class="row">
    <div class="col-md-10 col-md-offset-1">
        <p class="explanation">
	        Export your published Known content as an RSS file. You can import this file into Known or WordPress.
        </p>
        <h3>
            Generate RSS file
        </h3>        
        <form action="<?=\Idno\Core\Idno::site()->config()->getDisplayURL()?>admin/export/rss" method="post">
            <div class="row">
                <div class="col-md-3">
                    <p><label class="control-label" for="allposts"><strong>Include private posts?</strong></label></p>
                </div>
                <div class="config-toggle col-md-3">
                    <input type="checkbox" data-toggle="toggle" data-onstyle="info" data-on="Yes" data-off="No"
                           name="allposts" id="allposts"
                           value="1">
                </div>
                <div class="col-md-6">
                    <p class="config-desc">Some platforms may assume that your content should be displayed publicly. To protect your privacy, you may wish to only download your public content.</p>
                </div>
            </div>
            <p>
                <input type="submit" class="btn btn-primary" value="Download file">
            </p>
            <?php

                echo \Idno\Core\Idno::site()->actions()->signForm(\Idno\Core\Idno::site()->config()->getDisplayURL() . 'admin/export/rss');

            ?>
        </form>

    </div>
</div>